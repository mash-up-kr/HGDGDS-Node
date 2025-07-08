import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { FilesService } from '@/files/files.service';
import { ReservationResultsService } from './reservation-results.service';
import { User } from '@/users/entities/user.entity';
import { UserRole } from '@/common/enums/user-role';
import { ProfileImageCode } from '@/common/enums/profile-image-code';
import {
  ReservationAccessDeniedException,
  ReservationNotFoundException,
} from '@/common/exception/reservation.exception';
import { UserNotFoundException } from '@/common/exception/user.exception';
import { EmptyTokenListException } from '@/common/exception/firebase.exception';

// User 엔티티 기반 Mock 데이터
const mockPokerUser: User = {
  id: 1,
  nickname: '콕찌르는사람',
  profileImageCode: ProfileImageCode.BLUE,
  deviceId: 'device-id-poker-123',
  role: UserRole.USER,
  reservationAlarmSetting: true,
  kokAlarmSetting: true,
  fcmToken: 'fcm-token-for-poker-user',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

// 테스트를 위한 목 서비스 정의
const mockReservationsService = {
  kokUserInReservation: jest.fn(),
};

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: ReservationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
        {
          provide: FilesService,
          useValue: {},
        },
        {
          provide: ReservationResultsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    service = module.get<ReservationsService>(ReservationsService);
  });

  // 모든 테스트가 끝난 후 mock 함수 기록을 초기화
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('kokReservation (콕찌르기)', () => {
    const reservationId = 12345;
    const targetUserId = 67890;

    it('성공: 콕찌르기 요청을 성공적으로 서비스에 전달해야 한다', async () => {
      jest.spyOn(service, 'kokUserInReservation').mockResolvedValue(undefined);

      await controller.kokReservation(
        mockPokerUser,
        reservationId,
        targetUserId,
      );

      // Assert: 서비스의 kokUserInReservation이 정확한 인자들과 함께 1번 호출되었는지 확인
      expect(service.kokUserInReservation).toHaveBeenCalledTimes(1);
      expect(service.kokUserInReservation).toHaveBeenCalledWith(
        reservationId,
        mockPokerUser,
        targetUserId,
      );
    });

    it('실패: 예약 멤버가 아닐 경우 ReservationAccessDeniedException 그대로 던져야 한다', async () => {
      // Arrange: 서비스가 ReservationAccessDeniedException 던지도록 설정
      const expectedError = new ReservationAccessDeniedException();
      jest
        .spyOn(service, 'kokUserInReservation')
        .mockRejectedValue(expectedError);

      // Act & Assert: 컨트롤러 메서드 호출 시 동일한 에러가 발생하는지 확인
      await expect(
        controller.kokReservation(mockPokerUser, reservationId, targetUserId),
      ).rejects.toThrow(expectedError);
    });

    it('실패: 예약 정보를 찾을 수 없을 경우 ReservationNotFoundException을 그대로 던져야 한다', async () => {
      // Arrange: 서비스가 ReservationNotFoundException을 던지도록 설정
      const expectedError = new ReservationNotFoundException();
      jest
        .spyOn(service, 'kokUserInReservation')
        .mockRejectedValue(expectedError);

      // Act & Assert: 컨트롤러 메서드 호출 시 동일한 에러가 발생하는지 확인
      await expect(
        controller.kokReservation(mockPokerUser, reservationId, targetUserId),
      ).rejects.toThrow(expectedError);
    });

    it('실패: 찔리는 사용자를 찾을 수 없을 경우 UserNotFoundException을 그대로 던져야 한다', async () => {
      // Arrange: 서비스가 UserNotFoundException을 던지도록 설정
      const expectedError = new UserNotFoundException();
      jest
        .spyOn(service, 'kokUserInReservation')
        .mockRejectedValue(expectedError);

      // Act & Assert: 컨트롤러 메서드 호출 시 동일한 에러가 발생하는지 확인
      await expect(
        controller.kokReservation(mockPokerUser, reservationId, targetUserId),
      ).rejects.toThrow(expectedError);
    });

    it('실패: 찔리는 사용자의 FCM 토큰이 없을 경우 EmptyTokenListException을 그대로 던져야 한다', async () => {
      // Arrange: 서비스가 EmptyTokenListException을 던지도록 설정
      const expectedError = new EmptyTokenListException();
      jest
        .spyOn(service, 'kokUserInReservation')
        .mockRejectedValue(expectedError);

      // Act & Assert: 컨트롤러 메서드 호출 시 동일한 에러가 발생하는지 확인
      await expect(
        controller.kokReservation(mockPokerUser, reservationId, targetUserId),
      ).rejects.toThrow(expectedError);
    });
  });
});
