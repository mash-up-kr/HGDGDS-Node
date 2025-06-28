import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UserReservation } from './entities/user-reservation.entity';
import { Image } from '@/images/entities/images.entity';
import { ImageParentType } from '@/common/enums/image-parent-type';
import {
  ReservationAlreadyJoinedException,
  ReservationFullException,
  ReservationNotFoundException,
  NoEditPermissionException,
  CannotEditStartedException,
  InvalidTimeUpdateException,
} from '@/common/exception/reservation.exception';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly dataSource: DataSource,
  ) {}

  async createReservation(
    reservationData: CreateReservationDto,
  ): Promise<Reservation> {
    return await this.dataSource.transaction(async (manager) => {
      const reservationRepo = manager.getRepository(Reservation);
      const imageRepo = manager.getRepository(Image);
      const userReservationRepo = manager.getRepository(UserReservation);

      // 1. Reservation 저장
      const reservation: Reservation = reservationRepo.create(reservationData);
      const savedReservation: Reservation =
        await reservationRepo.save(reservation);

      // 2. Image 저장
      const images =
        reservationData.images?.map((path) => {
          const image = new Image();
          image.s3FilePath = path;
          image.parentType = ImageParentType.RESERVATION;
          image.parentId = savedReservation.id;
          return imageRepo.create(image);
        }) || [];
      await manager.getRepository(Image).save(images);

      // 3. UserReservation 저장
      const userReservation = userReservationRepo.create({
        user: reservation.host,
        reservation: savedReservation,
      });
      await manager.getRepository(UserReservation).save(userReservation);

      return savedReservation;
    });
  }

  async joinReservation(
    reservationId: number,
    userId: number,
  ): Promise<UserReservation> {
    const maxParticipants = 30;

    return await this.dataSource.transaction(async (manager) => {
      const userReservationRepo = manager.getRepository(UserReservation);
      const reservationRepo = manager.getRepository(Reservation);

      // 1. Reservation 조회
      const reservation = await reservationRepo.findOne({
        where: { id: reservationId },
        relations: ['host'],
      });

      if (!reservation) {
        throw new ReservationNotFoundException();
      }

      // 2. 이미 가입된 예약인지 확인
      const existing = await userReservationRepo.findOne({
        where: {
          reservation: { id: reservationId },
          user: { id: userId },
        },
      });
      if (existing) {
        throw new ReservationAlreadyJoinedException();
      }

      // 3. 예약 멤버 수 확인
      const memberCount = await userReservationRepo.count({
        where: { reservation: { id: reservationId } },
      });
      if (memberCount >= maxParticipants) {
        throw new ReservationFullException();
      }

      // 4. UserReservation 생성
      const userReservation = userReservationRepo.create({
        user: { id: userId },
        reservation,
      });

      return await userReservationRepo.save(userReservation);
    });
  }

  async updateReservation(
    reservationId: number,
    userId: number,
    updateData: UpdateReservationDto,
  ): Promise<Reservation> {
    return await this.dataSource.transaction(async (manager) => {
      const reservationRepo = manager.getRepository(Reservation);
      const imageRepo = manager.getRepository(Image);

      // 1. 예약 조회 및 검증
      const reservation = await this.findAndValidateReservation(
        reservationRepo,
        reservationId,
        userId,
      );

      // 2. 시간 유효성 검증
      this.validateReservationTiming(
        reservation,
        updateData.reservationDatetime,
      );

      // 3. 예약 정보 업데이트
      this.updateReservationFields(reservation, updateData);
      const updatedReservation = await reservationRepo.save(reservation);

      // 4. 이미지 업데이트
      if (updateData.images !== undefined) {
        await this.updateReservationImages(
          imageRepo,
          reservationId,
          updateData.images,
        );
      }

      return updatedReservation;
    });
  }

  private async findAndValidateReservation(
    reservationRepo: Repository<Reservation>,
    reservationId: number,
    userId: number,
  ): Promise<Reservation> {
    const reservation = await reservationRepo.findOne({
      where: { id: reservationId },
      relations: ['host'],
    });

    if (!reservation) {
      throw new ReservationNotFoundException();
    }

    // 호스트만 수정 가능
    if (reservation.host.id !== userId) {
      throw new NoEditPermissionException();
    }

    return reservation;
  }

  private validateReservationTiming(
    reservation: Reservation,
    newDateTime?: Date,
  ): void {
    const now = new Date();

    // 시작된 예약은 수정 불가
    if (reservation.reservationDatetime <= now) {
      throw new CannotEditStartedException();
    }

    // 수정할 시간이 과거인지 확인. 현재보다 과거의 예약은 있을 수 없음
    if (newDateTime && newDateTime <= now) {
      throw new InvalidTimeUpdateException();
    }
  }

  private updateReservationFields(
    reservation: Reservation,
    updateData: UpdateReservationDto,
  ): void {
    Object.assign(reservation, {
      ...(updateData.title !== undefined && { title: updateData.title }),
      ...(updateData.category !== undefined && {
        category: updateData.category,
      }),
      ...(updateData.reservationDatetime !== undefined && {
        reservationDatetime: updateData.reservationDatetime,
      }),
      ...(updateData.description !== undefined && {
        description: updateData.description,
      }),
      ...(updateData.linkUrl !== undefined && { linkUrl: updateData.linkUrl }),
    });
  }

  private async updateReservationImages(
    imageRepo: Repository<Image>,
    reservationId: number,
    images: string[],
  ): Promise<void> {
    // 기존 이미지 삭제
    await imageRepo.delete({
      parentType: ImageParentType.RESERVATION,
      parentId: reservationId,
    });

    // 새로운 이미지 저장
    if (images.length > 0) {
      const imageEntities = images.map((path) => {
        const image = new Image();
        image.s3FilePath = path;
        image.parentType = ImageParentType.RESERVATION;
        image.parentId = reservationId;
        return imageRepo.create(image);
      });
      await imageRepo.save(imageEntities);
    }
  }

  async getParticipantCount(reservationId: number): Promise<number> {
    return await this.dataSource
      .getRepository(UserReservation)
      .count({ where: { reservation: { id: reservationId } } });
  }
}
