import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import { ReservationResultsService } from './reservation-results.service';
import { Reservation } from './entities/reservation.entity';
import { UserReservation } from './entities/user-reservation.entity';
import { ReservationResult } from './entities/reservation-result.entity';
import { Image } from '@/images/entities/images.entity';
import { FilesService } from '@/files/files.service';
import { GetReservationResultsResponse } from './dto/response/get-reservation-results.response';
import {
  ReservationAccessDeniedException,
  ReservationNotDoneException,
  ReservationNotFoundException,
} from '@/common/exception/reservation.exception';
import { ReservationResultStatus } from '@/common/enums/reservation-result-status';
import { ProfileImageCode } from '@/common/enums/profile-image-code';

// Mock 타입 정의
type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;
const createMockRepository = <
  T extends ObjectLiteral,
>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
});

describe('ReservationResultsService', () => {
  let service: ReservationResultsService;
  let reservationRepository: MockRepository<Reservation>;
  let userReservationRepository: MockRepository<UserReservation>;
  let reservationResultRepository: MockRepository<ReservationResult>;
  let imageRepository: MockRepository<Image>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationResultsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(UserReservation),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(ReservationResult),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Image),
          useValue: createMockRepository(),
        },
        { provide: DataSource, useValue: {} }, // createReservationResult 테스트가 아니므로 간단히 모킹
        {
          provide: FilesService,
          useValue: {
            getAccessPresignedUrl: jest
              .fn()
              .mockResolvedValue('https://s3.com/presigned-url.jpg'),
          },
        },
      ],
    }).compile();

    service = module.get<ReservationResultsService>(ReservationResultsService);
    reservationRepository = module.get(getRepositoryToken(Reservation));
    userReservationRepository = module.get(getRepositoryToken(UserReservation));
    reservationResultRepository = module.get(
      getRepositoryToken(ReservationResult),
    );
    imageRepository = module.get(getRepositoryToken(Image));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getReservationResults', () => {
    const reservationId = 1;
    const currentUserId = 1;
    const hostId = 10;
    let mockReservation: Reservation;
    let mockMembership: UserReservation;

    beforeEach(() => {
      // 모든 테스트에서 공통으로 사용될 성공적인 권한 검증 모킹
      mockReservation = {
        id: reservationId,
        reservationDatetime: new Date('2020-01-01'),
        host: { id: hostId },
      } as Reservation;
      mockMembership = { id: 1 } as UserReservation;
      (reservationRepository.findOne as jest.Mock).mockResolvedValue(
        mockReservation,
      );
      (userReservationRepository.findOne as jest.Mock).mockResolvedValue(
        mockMembership,
      );
      (imageRepository.find as jest.Mock).mockResolvedValue([]); // 기본적으로 이미지는 없다고 가정
    });

    it('호스트와 참가자의 결과가 모두 있을 때, DTO를 올바르게 반환해야 한다', async () => {
      // Arrange
      const mockResults = [
        {
          id: 101,
          user: {
            id: hostId,
            nickname: '호스트',
            profileImageCode: ProfileImageCode.GREEN,
          },
          reservation: { id: reservationId },
          status: ReservationResultStatus.SUCCESS,
        },
        {
          id: 102,
          user: {
            id: 2,
            nickname: '참가자1',
            profileImageCode: ProfileImageCode.BLUE,
          },
          reservation: { id: reservationId },
          status: ReservationResultStatus.FAIL,
        },
      ] as ReservationResult[];
      (reservationResultRepository.find as jest.Mock).mockResolvedValue(
        mockResults,
      );

      // Act
      const result = await service.getReservationResults(
        reservationId,
        currentUserId,
      );

      // Assert
      expect(result).toBeInstanceOf(GetReservationResultsResponse);
      expect(result.host).toBeDefined();
      expect(result.host?.userId).toBe(hostId);
      expect(result.results.length).toBe(1);
      expect(result.results[0].userId).toBe(2);
    });

    it('호스트의 결과가 없을 때, host는 null이고 참가자 결과만 반환해야 한다', async () => {
      // Arrange
      const mockResults = [
        {
          id: 102,
          user: {
            id: 2,
            nickname: '참가자1',
            profileImageCode: ProfileImageCode.BLUE,
          },
          reservation: { id: reservationId },
          status: ReservationResultStatus.FAIL,
        },
      ] as ReservationResult[];
      (reservationResultRepository.find as jest.Mock).mockResolvedValue(
        mockResults,
      );

      // Act
      const result = await service.getReservationResults(
        reservationId,
        currentUserId,
      );

      // Assert
      expect(result.host).toBeNull();
      expect(result.results.length).toBe(1);
    });

    it('결과 데이터가 아예 없을 때, host는 null이고 results는 빈 배열을 반환해야 한다', async () => {
      // Arrange
      (reservationResultRepository.find as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await service.getReservationResults(
        reservationId,
        currentUserId,
      );

      // Assert
      expect(result.host).toBeNull();
      expect(result.results).toEqual([]);
    });

    it('예약이 존재하지 않으면 ReservationNotFoundException을 던져야 한다', async () => {
      // Arrange
      (reservationRepository.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getReservationResults(reservationId, currentUserId),
      ).rejects.toThrow(ReservationNotFoundException);
    });

    it('사용자가 예약 멤버가 아니면 ReservationAccessDeniedException을 던져야 한다', async () => {
      // Arrange
      (userReservationRepository.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getReservationResults(reservationId, currentUserId),
      ).rejects.toThrow(ReservationAccessDeniedException);
    });

    it('예약 시간이 아직 지나지 않았으면 ReservationNotDoneException을 던져야 한다', async () => {
      // Arrange
      const futureReservation = {
        ...mockReservation,
        reservationDatetime: new Date('2099-01-01'),
      };
      (reservationRepository.findOne as jest.Mock).mockResolvedValue(
        futureReservation,
      );

      // Act & Assert
      await expect(
        service.getReservationResults(reservationId, currentUserId),
      ).rejects.toThrow(ReservationNotDoneException);
    });
  });
});
