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
  ReservationTimeNotReachedException,
  UserReservationNotFoundException,
  NotMemberOfReservationException,
} from '@/common/exception/reservation.exception';
import { ValidationFailedException } from '@/common/exception/request-parsing.exception';
import { UserReservationStatus } from '@/common/enums/user-reservation-status';
import { ReservationMemberDto } from './dto/reservation-member.dto';
import {
  GetReservationDetailResponse,
  HostInfoDto,
  CurrentUserInfoDto,
} from './dto/response/get-reservation-detail.response';
import { FilesService } from '@/files/files.service';
import { getProfileImagePath } from '@/common/enums/profile-image-code';
import { User } from '@/users/entities/user.entity';
import { FirebaseService } from '@/firebase/firebase.service';
import {
  EmptyTokenListException,
  NotificationSendFailedException,
} from '@/common/exception/firebase.exception';
import { UserNotFoundException } from '@/common/exception/user.exception';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(UserReservation)
    private readonly userReservationRepository: Repository<UserReservation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly filesService: FilesService,
    private readonly firebaseService: FirebaseService,
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

  async updateUserStatus(
    reservationId: number,
    userId: number,
    status: UserReservationStatus.DEFAULT | UserReservationStatus.READY,
  ): Promise<UserReservation> {
    return await this.dataSource.transaction(async (manager) => {
      const userReservationRepo = manager.getRepository(UserReservation);
      const reservationRepo = manager.getRepository(Reservation);

      // 1. 예약 조회
      const reservation = await reservationRepo.findOne({
        where: { id: reservationId },
      });

      if (!reservation) {
        throw new ReservationNotFoundException();
      }

      // 2. 예약 시간 접근 가늩 시간 확인
      const READY_ACCESS_TIME_MS = 60 * 60 * 1000; // 1시간
      const now = new Date();
      const accessTimeBeforeReservation = new Date(
        reservation.reservationDatetime.getTime() - READY_ACCESS_TIME_MS,
      );

      if (now < accessTimeBeforeReservation) {
        throw new ReservationTimeNotReachedException();
      }

      // 3. 사용자 예약 조회
      const userReservation = await userReservationRepo.findOne({
        where: {
          user: { id: userId },
          reservation: { id: reservationId },
        },
        relations: ['user', 'reservation'],
      });

      if (!userReservation) {
        throw new UserReservationNotFoundException();
      }

      // 4. 상태 업데이트
      userReservation.status = status;

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
    if (images.length > 3) {
      throw new ValidationFailedException(
        '이미지는 최대 3개까지만 업로드 가능합니다.',
      );
    }

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

  async getMemberCount(reservationId: number): Promise<number> {
    return await this.dataSource
      .getRepository(UserReservation)
      .count({ where: { reservation: { id: reservationId } } });
  }

  async getMembers(reservationId: number): Promise<ReservationMemberDto[]> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['host'],
    });

    // 예약이 존재하지 않으면 예외 처리
    if (!reservation) {
      throw new ReservationNotFoundException();
    }

    const hostId = reservation.host.id;

    const userReservations = await this.userReservationRepository.find({
      where: { reservation: { id: reservationId } },
      relations: ['user'],
    });
    if (!userReservations || userReservations.length === 0) {
      return [];
    }

    return userReservations.map(
      (elem) => new ReservationMemberDto(elem, hostId),
    );
  }

  async getReservationDetail(
    reservationId: number,
    currentUserId: number,
  ): Promise<GetReservationDetailResponse> {
    return await this.dataSource.transaction(async (manager) => {
      const reservationRepo = manager.getRepository(Reservation);
      const userReservationRepo = manager.getRepository(UserReservation);
      const imageRepo = manager.getRepository(Image);

      // 1. 예약 정보 조회 (호스트 정보 포함)
      const reservation = await reservationRepo.findOne({
        where: { id: reservationId },
        relations: ['host'],
      });

      if (!reservation) {
        throw new ReservationNotFoundException();
      }

      // 2. 현재 사용자의 예약 참가 정보 조회
      const userReservation = await userReservationRepo.findOne({
        where: {
          reservation: { id: reservationId },
          user: { id: currentUserId },
        },
        relations: ['user'],
      });

      // 3. 예약 이미지 조회
      const images = await imageRepo.find({
        where: {
          parentType: ImageParentType.RESERVATION,
          parentId: reservationId,
        },
      });

      // 4. 참가자 수 조회
      const participantCount = await userReservationRepo.count({
        where: { reservation: { id: reservationId } },
      });

      // 5. 이미지 URL 생성
      const imageUrls: string[] = [];
      for (const image of images) {
        try {
          const url = await this.filesService.getAccessPresignedUrl(
            image.s3FilePath,
          );
          imageUrls.push(url);
        } catch (error) {
          console.error(`이미지 URL 생성 실패: ${image.s3FilePath}`, error);
        }
      }

      // 6. 호스트 프로필 이미지 URL 생성
      const hostProfileImagePath = getProfileImagePath(
        reservation.host.profileImageCode,
      );
      let hostProfileImageUrl: string;
      try {
        hostProfileImageUrl =
          await this.filesService.getAccessPresignedUrl(hostProfileImagePath);
      } catch (error) {
        console.error('호스트 프로필 이미지 URL 생성 실패:', error);
        hostProfileImageUrl = hostProfileImagePath;
      }

      // 7. 응답 데이터 구성
      const maxParticipants = 30;
      const isHost = reservation.host.id === currentUserId;
      const canEdit = isHost && reservation.reservationDatetime > new Date();
      const canJoin =
        !userReservation && !isHost && participantCount < maxParticipants;

      const hostInfo: HostInfoDto = {
        hostId: reservation.host.id,
        nickname: reservation.host.nickname,
        profileImageName: hostProfileImageUrl,
      };

      const currentUserInfo: CurrentUserInfoDto = {
        userId: currentUserId,
        status: userReservation?.status || UserReservationStatus.DEFAULT,
        isHost,
        canEdit,
        canJoin,
      };

      return new GetReservationDetailResponse(
        reservation.id,
        reservation.title,
        reservation.category,
        reservation.reservationDatetime.toISOString(),
        reservation.description,
        reservation.linkUrl,
        imageUrls,
        hostInfo,
        currentUserInfo,
        participantCount,
        30, // 최대 참가자 수
        reservation.createdAt.toISOString(),
        reservation.updatedAt.toISOString(),
      );
    });
  }
  async kokUserInReservation(
    reservationId: number,
    pokerUser: User,
    pokedUserId: number,
  ): Promise<void> {
    // 1. 예약 정보 조회
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
    });
    if (!reservation) {
      throw new ReservationNotFoundException();
    }

    // 3. 유효성 검사 (멤버)
    // 콕찌르는 사람(poker)과 찔리는 사람(poked)이 모두 해당 예약의 멤버인지 확인
    const memberships = await this.userReservationRepository.find({
      where: [
        { reservation: { id: reservationId }, user: { id: pokerUser.id } },
        { reservation: { id: reservationId }, user: { id: pokedUserId } },
      ],
    });

    const isPokerMember = memberships.some((m) => m.user.id === pokerUser.id);
    const isPokedMember = memberships.some((m) => m.user.id === pokedUserId);

    if (!isPokerMember || !isPokedMember) {
      throw new NotMemberOfReservationException();
    }

    // 3. 콕찔림 당하는 사용자의 정보 (FCM 토큰) 조회
    const pokedUser = await this.userRepository.findOne({
      where: { id: pokedUserId },
    });
    if (!pokedUser) {
      throw new UserNotFoundException();
    }
    if (!pokedUser.fcmToken) {
      throw new EmptyTokenListException();
    }
    // 4. 알림 메시지 생성 및 전송
    const title = '${pokerUser.nickname}님이 콕 찔렀어요';
    const message = `${reservation.title} 예약을 준비하세요`;

    try {
      await this.firebaseService.sendNotification(
        pokedUser.fcmToken,
        title,
        message,
      );
    } catch (error) {
      throw new NotificationSendFailedException();
    }
  }
}
