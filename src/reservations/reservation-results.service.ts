import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, QueryFailedError, Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { UserReservation } from './entities/user-reservation.entity';
import { ReservationResult } from './entities/reservation-result.entity';
import { Image } from '@/images/entities/images.entity';
import { User } from '@/users/entities/user.entity';
import { FilesService } from '@/files/files.service';
import { CreateReservationResultRequest } from './dto/request/create-reservation-result.request';
import { GetReservationResultsResponse } from './dto/response/get-reservation-results.response';
import { CreateReservationResultDto } from './dto/response/create-reservation-result.dto';
import { ImageParentType } from '@/common/enums/image-parent-type';
import { UserReservationStatus } from '@/common/enums/user-reservation-status';
import { ReservationResultStatus } from '@/common/enums/reservation-result-status';
import {
  ReservationAccessDeniedException,
  ReservationNotDoneException,
  ReservationNotFoundException,
  ReservationResultAlreadyExistsException,
  UserReservationNotFoundException,
} from '@/common/exception/reservation.exception';

@Injectable()
export class ReservationResultsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(UserReservation)
    private readonly userReservationRepository: Repository<UserReservation>,
    @InjectRepository(ReservationResult)
    private readonly reservationResultRepository: Repository<ReservationResult>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly dataSource: DataSource,
    private readonly filesService: FilesService,
  ) {}

  async createReservationResult(
    reservationId: number,
    user: User,
    reservationData: CreateReservationResultRequest,
  ): Promise<ReservationResult> {
    let userReservationStatus: UserReservationStatus;
    if (reservationData.status === ReservationResultStatus.FAIL) {
      userReservationStatus = UserReservationStatus.FAIL;
    } else {
      userReservationStatus = UserReservationStatus.SUCCESS;
    }

    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
    });
    if (!reservation) {
      throw new ReservationNotFoundException();
    }

    const userReservation = await this.userReservationRepository.findOne({
      where: {
        reservation: { id: reservationId },
        user: { id: user.id },
      },
    });
    if (!userReservation) {
      throw new UserReservationNotFoundException();
    }

    let result: ReservationResult;
    try {
      result = await this.dataSource.transaction(async (manager) => {
        const reservationResultRepo = manager.getRepository(ReservationResult);
        const imageRepo = manager.getRepository(Image);
        const userReservationRepo = manager.getRepository(UserReservation);

        const reservationResult: ReservationResult =
          reservationResultRepo.create(reservationData);
        reservationResult.user = user;
        reservationResult.reservation = reservation;
        const savedReservationResult: ReservationResult =
          await reservationResultRepo.save(reservationResult);

        const images =
          reservationData.images?.map((path) => {
            const image = new Image();
            image.s3FilePath = path;
            image.parentType = ImageParentType.RESERVATION_RESULT;
            image.parentId = savedReservationResult.id;
            return imageRepo.create(image);
          }) || [];
        await manager.getRepository(Image).save(images);

        await userReservationRepo.update(
          {
            user: reservationResult.user,
            reservation: reservationResult.reservation,
          },
          {
            status: userReservationStatus,
          },
        );

        return savedReservationResult;
      });
    } catch (error) {
      const UNIQUE_VIOLATION = '23505';

      if (
        error instanceof QueryFailedError &&
        'code' in error &&
        (error as QueryFailedError & { code: string }).code === UNIQUE_VIOLATION
      ) {
        throw new ReservationResultAlreadyExistsException();
      }
      throw error;
    }

    return result;
  }

  async getReservationResults(
    reservationId: number,
    currentUserId: number,
  ): Promise<GetReservationResultsResponse> {
    await this.validateAccessAndGetReservation(reservationId, currentUserId);

    // 현재 사용자 결과와 다른 참가자 결과를 조회합니다.
    const [currentUserResult, otherParticipantResults] = await Promise.all([
      this.reservationResultRepository.findOne({
        where: {
          reservation: { id: reservationId },
          user: { id: currentUserId },
        },
        relations: { user: true, reservation: true },
      }),
      this.reservationResultRepository.find({
        where: {
          reservation: { id: reservationId },
          user: { id: Not(currentUserId) },
        },
        relations: { user: true, reservation: true },
      }),
    ]);

    let currentUserResultDto: CreateReservationResultDto | null = null;
    let imageUrlMap: Map<number, string[]> = new Map();

    if (currentUserResult) {
      const allResultIds = [
        currentUserResult.id,
        ...otherParticipantResults.map((r) => r.id),
      ];
      imageUrlMap = await this.generateImageUrlMapForResults(allResultIds);

      currentUserResultDto = new CreateReservationResultDto(
        currentUserResult,
        imageUrlMap.get(currentUserResult.id) || null,
      );
    } else {
      const otherResultIds = otherParticipantResults.map((r) => r.id);
      imageUrlMap = await this.generateImageUrlMapForResults(otherResultIds);
    }

    const otherParticipantResultDtos = otherParticipantResults.map(
      (result) =>
        new CreateReservationResultDto(
          result,
          imageUrlMap.get(result.id) || null,
        ),
    );

    return new GetReservationResultsResponse(
      currentUserResultDto,
      otherParticipantResultDtos,
    );
  }

  private async validateAccessAndGetReservation(
    reservationId: number,
    currentUserId: number,
  ): Promise<void> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
    });
    if (!reservation) throw new ReservationNotFoundException();

    const membership = await this.userReservationRepository.findOne({
      where: {
        reservation: { id: reservationId },
        user: { id: currentUserId },
      },
    });
    if (!membership) throw new ReservationAccessDeniedException();

    if (new Date() < reservation.reservationDatetime) {
      throw new ReservationNotDoneException();
    }
  }

  private async generateImageUrlMapForResults(
    resultIds: number[],
  ): Promise<Map<number, string[]>> {
    const imageUrlMap = new Map<number, string[]>();
    if (resultIds.length === 0) return imageUrlMap;

    const images = await this.imageRepository.find({
      where: {
        parentType: ImageParentType.RESERVATION_RESULT,
        parentId: In(resultIds),
      },
    });

    const urlPromises = images.map(async (image) => {
      try {
        const url = await this.filesService.getAccessPresignedUrl(
          image.s3FilePath,
        );
        return { parentId: image.parentId, url };
      } catch {
        return { parentId: image.parentId, url: null };
      }
    });

    const urlResults = await Promise.all(urlPromises);

    urlResults.forEach(({ parentId, url }) => {
      if (url && parentId) {
        if (!imageUrlMap.has(parentId)) imageUrlMap.set(parentId, []);
        imageUrlMap.get(parentId)!.push(url);
      }
    });

    return imageUrlMap;
  }
}
