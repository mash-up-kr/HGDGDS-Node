import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  DataSource,
  LessThan,
  MoreThanOrEqual,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { ReservationsService } from './reservations.service';
import { Reservation } from './entities/reservation.entity';
import { UserReservation } from './entities/user-reservation.entity';
import { User } from '@/users/entities/user.entity';
import { Image } from '@/images/entities/images.entity';
import { FilesService } from '@/files/files.service';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '@/firebase/firebase.service';

import {
  GetReservationsQueryDto,
  ReservationStatusFilter,
} from '@/docs/dto/reservation.dto';
import { ReservationCategory } from '@/common/enums/reservation-category';
import { OrderCondition } from '@/common';
import { UserReservationStatus } from '@/common/enums/user-reservation-status';
import { ProfileImageCode } from '@/common/enums/profile-image-code';
import { GetReservationsResponse } from '@/reservations/dto/response/get-reservation-response';

// Mock 타입 정의
type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;
const createMockRepository = <
  T extends ObjectLiteral,
>(): MockRepository<T> => ({
  findAndCount: jest.fn(),
  count: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
});

// Transaction Mock 타입 정의
type MockManager = { getRepository: jest.Mock };
type TransactionCallback = (manager: MockManager) => Promise<any>;

describe('ReservationsService', () => {
  let service: ReservationsService;
  let userReservationRepository: MockRepository<UserReservation>;
  let imageRepository: MockRepository<Image>;

  beforeEach(async () => {
    const mockDataSource = {
      transaction: jest.fn().mockImplementation((cb: TransactionCallback) => {
        const mockManager = {
          getRepository: jest.fn().mockReturnValue(createMockRepository()),
        };
        return cb(mockManager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: DataSource, useValue: mockDataSource },
        {
          provide: getRepositoryToken(Reservation),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(UserReservation),
          useValue: createMockRepository(),
        },
        { provide: getRepositoryToken(User), useValue: createMockRepository() },
        {
          provide: getRepositoryToken(Image),
          useValue: createMockRepository(),
        },
        {
          provide: FilesService,
          useValue: {
            getAccessPresignedUrl: jest
              .fn()
              .mockResolvedValue('https://s3.com/presigned-url.jpg'),
          },
        },
        { provide: FirebaseService, useValue: {} },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    userReservationRepository = module.get(getRepositoryToken(UserReservation));
    imageRepository = module.get(getRepositoryToken(Image));
  });

  describe('getReservations', () => {
    const currentUserId = 1;
    let mockUserReservationsFromFindAndCount: UserReservation[];

    beforeEach(() => {
      // findAndCount가 반환할 가짜 데이터
      mockUserReservationsFromFindAndCount = [
        {
          id: 1,
          status: UserReservationStatus.DEFAULT,
          reservation: {
            id: 101,
            title: '예정된 예약',
            category: ReservationCategory.SPORTS,
            reservationDatetime: new Date('2099-01-01T12:00:00Z'),
            host: { id: 1, nickname: '호스트' },
          },
        } as UserReservation,
      ];

      (userReservationRepository.find as jest.Mock).mockResolvedValue([
        {
          createdAt: new Date('2024-05-25T12:00:00Z'),
          reservation: { id: 101 },
          user: { profileImageCode: ProfileImageCode.PINK },
        },
        {
          createdAt: new Date('2024-05-25T11:00:00Z'),
          reservation: { id: 101 },
          user: { profileImageCode: ProfileImageCode.BLUE },
        },
        {
          createdAt: new Date('2024-05-25T10:00:00Z'),
          reservation: { id: 101 },
          user: { profileImageCode: ProfileImageCode.GREEN },
        },
        {
          createdAt: new Date('2024-05-25T09:00:00Z'),
          reservation: { id: 101 },
          user: { profileImageCode: ProfileImageCode.ORANGE },
        }, // 4번째 멤버, slice 대상에서 제외되어야 함
      ] as UserReservation[]);

      // getImageUrlMap 내부의 `find` 메서드를 모킹합니다.
      (imageRepository.find as jest.Mock).mockResolvedValue([
        { parentId: 101, s3FilePath: 'path/image1.jpg' },
      ] as Image[]);
    });

    it('최신 참여자 3명의 프로필 코드를 최신순으로 올바르게 반환해야 한다', async () => {
      const query = Object.assign(new GetReservationsQueryDto(), {
        page: 1,
        limit: 10,
        order: OrderCondition.DESC,
      });
      (userReservationRepository.findAndCount as jest.Mock).mockResolvedValue([
        mockUserReservationsFromFindAndCount,
        1,
      ]);

      const result = await service.getReservations(query, currentUserId);
      const firstReservation = result.reservations[0];

      expect(firstReservation).toBeDefined();
      expect(firstReservation.profileImageCodeList.length).toBe(3); // 상위 3개만 포함되는지 확인
      expect(firstReservation.profileImageCodeList).toEqual([
        // 최신순으로 정렬되었는지 확인
        ProfileImageCode.PINK,
        ProfileImageCode.BLUE,
        ProfileImageCode.GREEN,
      ]);
    });

    it('필터가 없을 때 전체 예약 목록을 페이지네이션하여 반환해야 한다', async () => {
      const query = Object.assign(new GetReservationsQueryDto(), {
        page: 1,
        limit: 10,
        order: OrderCondition.DESC,
      });
      (userReservationRepository.findAndCount as jest.Mock).mockResolvedValue([
        mockUserReservationsFromFindAndCount,
        1,
      ]);

      const result = await service.getReservations(query, currentUserId);

      expect(result).toBeInstanceOf(GetReservationsResponse);
      expect(result.reservations.length).toBe(1);
      expect(result.metadata.total).toBe(1);
      expect(result.reservations[0].isHost).toBe(true);
    });

    it('status=after 필터가 있을 때 예정된 예약만 반환해야 한다', async () => {
      const query = Object.assign(new GetReservationsQueryDto(), {
        page: 1,
        limit: 10,
        order: OrderCondition.DESC,
        status: ReservationStatusFilter.AFTER,
      });
      (userReservationRepository.findAndCount as jest.Mock).mockResolvedValue([
        mockUserReservationsFromFindAndCount,
        1,
      ]);

      const result = await service.getReservations(query, currentUserId);

      expect(result.reservations.length).toBe(1);
      expect(result.metadata.total).toBe(1);
      expect(userReservationRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            reservation: {
              reservationDatetime: MoreThanOrEqual(expect.any(Date)),
            },
          }),
        }),
      );
    });

    it('status=before 필터가 있을 때 지난 예약만 반환해야 한다', async () => {
      const query = Object.assign(new GetReservationsQueryDto(), {
        page: 1,
        limit: 10,
        order: OrderCondition.DESC,
        status: ReservationStatusFilter.BEFORE,
      });
      (userReservationRepository.findAndCount as jest.Mock).mockResolvedValue([
        mockUserReservationsFromFindAndCount,
        1,
      ]);

      const result = await service.getReservations(query, currentUserId);

      expect(result.reservations.length).toBe(1);
      expect(result.metadata.total).toBe(1);
      expect(userReservationRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            reservation: { reservationDatetime: LessThan(expect.any(Date)) },
          }),
        }),
      );
    });

    it('결과가 없을 때 빈 배열과 메타데이터를 반환해야 한다', async () => {
      const query = Object.assign(new GetReservationsQueryDto(), {
        page: 1,
        limit: 10,
        order: OrderCondition.DESC,
      });
      (userReservationRepository.findAndCount as jest.Mock).mockResolvedValue([
        [],
        0,
      ]);

      const result = await service.getReservations(query, currentUserId);

      expect(result.reservations.length).toBe(0);
      expect(result.metadata.total).toBe(0);
      expect(userReservationRepository.find).not.toHaveBeenCalled();
      expect(imageRepository.find).not.toHaveBeenCalled();
    });
  });
});
