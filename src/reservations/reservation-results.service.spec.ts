import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Not, ObjectLiteral, Repository } from 'typeorm';
import { ReservationResultsService } from './reservation-results.service';
import { Reservation } from './entities/reservation.entity';
import { UserReservation } from './entities/user-reservation.entity';
import { ReservationResult } from './entities/reservation-result.entity';
import { Image } from '@/images/entities/images.entity';
import { FilesService } from '@/files/files.service';
import {
  CurrentUserResultNotFoundException,
  ReservationNotFoundException,
} from '@/common/exception/reservation.exception';

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
        { provide: DataSource, useValue: {} },
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

  describe('getReservationResults', () => {
    const reservationId = 1;
    const currentUserId = 1;
    let mockReservation: Reservation;
    let mockMembership: UserReservation;

    beforeEach(() => {
      // 권한 검증 통과 모킹
      mockReservation = {
        id: reservationId,
        reservationDatetime: new Date('2020-01-01'),
      } as Reservation;
      mockMembership = { id: 1 } as UserReservation;
      (reservationRepository.findOne as jest.Mock).mockResolvedValue(
        mockReservation,
      );
      (userReservationRepository.findOne as jest.Mock).mockResolvedValue(
        mockMembership,
      );
      (imageRepository.find as jest.Mock).mockResolvedValue([]);
    });

    it('현재 사용자와 다른 참가자의 결과가 모두 있을 때, DTO를 올바르게 반환해야 한다', async () => {
      // Arrange
      const currentUserResult = {
        id: 101,
        user: { id: currentUserId, nickname: '나' },
        reservation: { id: reservationId },
      } as ReservationResult;
      const otherResults = [
        {
          id: 102,
          user: { id: 2, nickname: '다른사람' },
          reservation: { id: reservationId },
        },
      ] as ReservationResult[];

      (reservationResultRepository.findOne as jest.Mock).mockResolvedValue(
        currentUserResult,
      );
      (reservationResultRepository.find as jest.Mock).mockResolvedValue(
        otherResults,
      );

      // Act
      const result = await service.getReservationResults(
        reservationId,
        currentUserId,
      );

      // Assert
      expect(result.currentUser.userId).toBe(currentUserId);
      expect(result.currentUser.nickname).toBe('나');
      expect(result.results.length).toBe(1);
      expect(result.results[0].userId).toBe(2);
      expect(result.results[0].nickname).toBe('다른사람');

      // ⭐️ Mock 호출 검증
      expect(reservationResultRepository.findOne).toHaveBeenCalledWith({
        where: {
          reservation: { id: reservationId },
          user: { id: currentUserId },
        },
        relations: { user: true, reservation: true },
      });
      expect(reservationResultRepository.find).toHaveBeenCalledWith({
        where: {
          reservation: { id: reservationId },
          user: { id: Not(currentUserId) },
        },
        relations: { user: true, reservation: true },
      });
    });

    it('현재 사용자의 결과가 없을 때, CurrentUserResultNotFoundException을 던져야 한다', async () => {
      // Arrange
      // findOne이 null을 반환하도록 설정
      (reservationResultRepository.findOne as jest.Mock).mockResolvedValue(
        null,
      );

      // Act & Assert
      await expect(
        service.getReservationResults(reservationId, currentUserId),
      ).rejects.toThrow(CurrentUserResultNotFoundException);

      expect(reservationResultRepository.find).not.toHaveBeenCalled();
    });

    it('다른 참가자의 결과가 없을 때, currentUser는 있고 results는 빈 배열을 반환해야 한다', async () => {
      // Arrange
      const currentUserResult = {
        id: 101,
        user: { id: currentUserId, nickname: '나' },
        reservation: { id: reservationId },
      } as ReservationResult;
      (reservationResultRepository.findOne as jest.Mock).mockResolvedValue(
        currentUserResult,
      );
      (reservationResultRepository.find as jest.Mock).mockResolvedValue([]); // 다른 참가자 결과 없음

      // Act
      const result = await service.getReservationResults(
        reservationId,
        currentUserId,
      );

      // Assert
      expect(result.currentUser).toBeDefined();
      expect(result.results).toEqual([]);
    });

    it('예약이 존재하지 않으면 ReservationNotFoundException을 던져야 한다', async () => {
      (reservationRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        service.getReservationResults(reservationId, currentUserId),
      ).rejects.toThrow(ReservationNotFoundException);
    });
  });
});
