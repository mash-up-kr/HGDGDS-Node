import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsWhere,
  In,
  LessThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
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
  ReservationAccessDeniedException,
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
import {
  getProfileImagePath,
  ProfileImageCode,
} from '@/common/enums/profile-image-code';
import { User } from '@/users/entities/user.entity';
import { FirebaseService } from '@/firebase/firebase.service';
import {
  EmptyTokenListException,
  NotificationSendFailedException,
  SelfMessageNotAllowedException,
} from '@/common/exception/firebase.exception';
import { UserNotFoundException } from '@/common/exception/user.exception';
import { GetReservationsResponse } from '@/reservations/dto/response/get-reservation-response';
import { PaginationMetadata } from '@/common';
import {
  GetReservationsQueryDto,
  ReservationItemDto,
  ReservationStatusFilter,
} from '@/docs/dto/reservation.dto';
import { FCM_TEMPLATES } from '@/firebase/templates';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(UserReservation)
    private readonly userReservationRepository: Repository<UserReservation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
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
    currentUser: User,
    reservationId: number,
    userId: number,
    status: UserReservationStatus.DEFAULT | UserReservationStatus.READY,
  ): Promise<UserReservation> {
    // 1. 예약 조회
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new ReservationNotFoundException();
    }

    // 2. 예약 시간 접근 가능 시간 확인
    const READY_ACCESS_TIME_MS = 60 * 60 * 1000; // 1시간
    const now = new Date();
    const accessTimeBeforeReservation = new Date(
      reservation.reservationDatetime.getTime() - READY_ACCESS_TIME_MS,
    );

    if (now < accessTimeBeforeReservation) {
      throw new ReservationTimeNotReachedException();
    }

    // 3. 사용자 예약 조회
    const members = await this.userReservationRepository.find({
      where: {
        reservation: { id: reservationId },
      },
      relations: ['user'],
    });

    const me = members.find((elem) => elem.user.id === currentUser.id);
    if (!me) {
      throw new UserReservationNotFoundException();
    }

    me.status = status;

    if (status == UserReservationStatus.READY) {
      this.notifyOtherMembersIfReady(members, currentUser, reservation);
    }

    // 4. 상태 업데이트
    return await this.userReservationRepository.save(me);
  }

  private notifyOtherMembersIfReady(
    members: UserReservation[],
    currentUser: User,
    reservation: Reservation,
  ): void {
    const otherMembers = members.filter(
      (elem) => elem.user.id !== currentUser.id,
    );

    const title = FCM_TEMPLATES.IM_READY.title(currentUser.nickname);
    const message = FCM_TEMPLATES.IM_READY.message(
      currentUser.nickname,
      reservation.title,
    );

    const fcmTokens = otherMembers
      .map((member) => member.user.fcmToken)
      .filter((token): token is string => !!token);

    if (fcmTokens.length === 0) return;

    this.firebaseService
      .sendMulticastNotification(fcmTokens, title, message)
      .catch((err) =>
        console.error('[FCM ERROR] 준비 완료 알림 전송 실패', err),
      );
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
    // 2. 유효성 검사 (자기 자신 콕 찌르기 여부)
    if (pokerUser.id === pokedUserId) {
      throw new SelfMessageNotAllowedException();
    }

    // 3. 유효성 검사 (멤버)
    // 콕찌르는 사람(poker)과 찔리는 사람(poked)이 모두 해당 예약의 멤버인지 확인
    const memberships = await this.userReservationRepository.find({
      where: [
        { reservation: { id: reservationId }, user: { id: pokerUser.id } },
        { reservation: { id: reservationId }, user: { id: pokedUserId } },
      ],
      relations: ['user'],
    });

    const isPokerMember = memberships.some((m) => m.user.id === pokerUser.id);
    const isPokedMember = memberships.some((m) => m.user.id === pokedUserId);

    if (!isPokerMember || !isPokedMember) {
      throw new ReservationAccessDeniedException();
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
    const title = FCM_TEMPLATES.KOK.title(pokerUser.nickname);
    const message = FCM_TEMPLATES.KOK.message(reservation.title);

    try {
      await this.firebaseService.sendNotification(
        pokedUser.fcmToken,
        title,
        message,
      );
    } catch {
      throw new NotificationSendFailedException();
    }
  }

  async getReservations(
    query: GetReservationsQueryDto,
    currentUserId: number,
  ): Promise<GetReservationsResponse> {
    const maxParticipants = 30;
    const offset = (query.page - 1) * query.limit;
    const now = new Date();

    const whereClause: FindOptionsWhere<UserReservation> = {
      user: { id: currentUserId },
    };

    if (query.status === ReservationStatusFilter.AFTER) {
      whereClause.reservation = {
        reservationDatetime: MoreThanOrEqual(now),
      };
    } else if (query.status === ReservationStatusFilter.BEFORE) {
      whereClause.reservation = {
        reservationDatetime: LessThan(now),
      };
    }

    // 1. DB에서 필터링, 정렬, 페이징 + 호스트 정보 로드
    const [participantReservations, totalCount] =
      await this.userReservationRepository.findAndCount({
        where: whereClause,
        relations: {
          reservation: { host: true },
        },
        order: {
          reservation: { reservationDatetime: query.order },
        },
        take: query.limit,
        skip: offset,
      });

    if (totalCount === 0) {
      const metadata = new PaginationMetadata(query.page, query.limit, 0);
      return new GetReservationsResponse([], metadata);
    }

    const reservationIdsOnCurrentPage = participantReservations.map(
      (ur) => ur.reservation.id,
    );

    // 2. 여러 정보(참가자, 이미지)를 병렬로 가져옵니다.
    const [participantInfoMap, imageUrlMap] = await Promise.all([
      this.getParticipantInfoMap(reservationIdsOnCurrentPage),
      this.getImageUrlMap(reservationIdsOnCurrentPage),
    ]);

    // 3. DTO를 생성합니다.
    const pagedReservations = participantReservations.map((userReservation) => {
      const reservation = userReservation.reservation;
      const info = participantInfoMap.get(reservation.id) || {
        count: 0,
        profileImageCodeList: [],
      };
      const imageUrls = imageUrlMap.get(reservation.id) || [];

      return new ReservationItemDto(
        reservation.id,
        reservation.title,
        reservation.category,
        reservation.reservationDatetime,
        info.count,
        maxParticipants,
        reservation.host.id,
        reservation.host.nickname,
        imageUrls,
        userReservation.status,
        reservation.host.id === currentUserId,
        info.profileImageCodeList,
      );
    });

    // 4. 최종 응답 구성
    const metadata = new PaginationMetadata(
      query.page,
      query.limit,
      totalCount,
    );
    return new GetReservationsResponse(pagedReservations, metadata);
  }

  /**
   *  참가자 정보(수, 프로필 코드)를 Map 형태로 반환
   */
  private async getParticipantInfoMap(
    reservationIds: number[],
  ): Promise<
    Map<number, { count: number; profileImageCodeList: ProfileImageCode[] }>
  > {
    const finalInfoMap = new Map<
      number,
      { count: number; profileImageCodeList: ProfileImageCode[] }
    >();

    if (reservationIds.length === 0) return finalInfoMap;

    const userReservations = await this.userReservationRepository.find({
      select: {
        createdAt: true,
        reservation: {
          id: true,
        },
        user: {
          profileImageCode: true,
        },
      },
      relations: {
        reservation: true,
        user: true,
      },
      where: {
        reservation: {
          id: In(reservationIds),
        },
      },
    });

    const tempGroupedData = new Map<
      number,
      { profileImageCode: ProfileImageCode; joinedAt: Date }[]
    >();

    userReservations.forEach((ur) => {
      const reservationId = ur.reservation.id;
      if (!tempGroupedData.has(reservationId)) {
        tempGroupedData.set(reservationId, []);
      }
      tempGroupedData.get(reservationId)!.push({
        profileImageCode: ur.user.profileImageCode,
        joinedAt: ur.createdAt,
      });
    });

    for (const [reservationId, participants] of tempGroupedData.entries()) {
      // 참여 시점을 기준으로 내림차순 정렬 (최신순)
      const sortedParticipants = participants.sort(
        (a, b) => b.joinedAt.getTime() - a.joinedAt.getTime(),
      );

      // 정렬된 목록에서 상위 3개의 프로필 코드만 추출
      const top3ProfileCodes = sortedParticipants
        .slice(0, 3)
        .map((p) => p.profileImageCode);

      finalInfoMap.set(reservationId, {
        count: participants.length,
        profileImageCodeList: top3ProfileCodes,
      });
    }

    return finalInfoMap;
  }

  /**
   * 예약 이미지 URL들을 Map 형태로 반환
   */
  private async getImageUrlMap(
    reservationIds: number[],
  ): Promise<Map<number, string[]>> {
    const imageUrlMap = new Map<number, string[]>();
    if (reservationIds.length === 0) return imageUrlMap;

    // 1. 예약 ID에 해당하는 모든 이미지 엔티티를 한번에 조회
    const images = await this.imageRepository.find({
      where: {
        parentType: ImageParentType.RESERVATION,
        parentId: In(reservationIds),
      },
    });

    // 2. Presigned URL 생성 요청을 병렬로 처리하기 위해 Promise 배열 생성
    const urlPromises = images.map(async (image) => {
      try {
        const url = await this.filesService.getAccessPresignedUrl(
          image.s3FilePath,
        );
        return { parentId: image.parentId, url };
      } catch (error) {
        console.error(`Presigned URL 생성 실패: ${image.s3FilePath}`, error);
        return { parentId: image.parentId, url: null }; // 실패 시 null 반환
      }
    });

    // 3. 모든 URL 생성 요청을 병렬로 실행
    const urlResults = await Promise.all(urlPromises);

    // 4. 결과를 Map으로 그룹화
    urlResults.forEach(({ parentId, url }) => {
      if (url) {
        // URL 생성에 성공한 경우에만 추가
        if (!imageUrlMap.has(parentId)) {
          imageUrlMap.set(parentId, []);
        }
        imageUrlMap.get(parentId)!.push(url);
      }
    });

    return imageUrlMap;
  }
}
