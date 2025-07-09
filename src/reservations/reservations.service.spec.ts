import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import { ReservationsService } from './reservations.service';
import { Reservation } from './entities/reservation.entity';
import { UserReservation } from './entities/user-reservation.entity';
import { User } from '@/users/entities/user.entity';
import { Image } from '@/images/entities/images.entity';
import { FilesService } from '@/files/files.service';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '@/firebase/firebase.service';

import { GetReservationsQueryDto } from '@/docs/dto/reservation.dto';
import { ReservationCategory } from '@/common/enums/reservation-category';
import { OrderCondition } from '@/common';
import { UserReservationStatus } from '@/common/enums/user-reservation-status';
import { GetReservationsResponse } from '@/reservations/dto/response/get-reservation-response';

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
    // DataSource의 transaction 메서드 모킹
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

  // 기존 createReservation 테스트는 생략 (이전 코드에서 정상 동작)

  describe('getReservations', () => {
    const currentUserId = 1;
    let mockUserReservations: UserReservation[];

    beforeEach(() => {
      // 모든 테스트에서 사용할 공통 가짜 데이터
      mockUserReservations = [
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
        {
          id: 2,
          status: UserReservationStatus.READY,
          reservation: {
            id: 102,
            title: '지난 예약',
            category: ReservationCategory.FOOD,
            reservationDatetime: new Date('2020-01-01T12:00:00Z'),
            host: { id: 2, nickname: '다른사람' },
          },
        } as UserReservation,
      ];

      // getParticipantInfoMap에 대한 모킹 설정
      (
        userReservationRepository.createQueryBuilder as jest.Mock
      ).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { reservationId: 101, profileImageCode: 'PURPLE', count: '3' },
          { reservationId: 102, profileImageCode: 'PINK', count: '5' },
        ]),
      });

      // getImageUrlMap에 대한 모킹 설정
      (imageRepository.find as jest.Mock).mockResolvedValue([
        { parentId: 101, s3FilePath: 'path/image1.jpg' },
        { parentId: 102, s3FilePath: 'path/image2.jpg' },
      ] as Image[]);
    });

    it('필터가 없을 때 전체 예약 목록을 페이지네이션하여 반환해야 한다', async () => {
      const query = Object.assign(new GetReservationsQueryDto(), {
        page: 1,
        limit: 10,
        order: OrderCondition.DESC,
      });
      (userReservationRepository.findAndCount as jest.Mock).mockResolvedValue([
        mockUserReservations,
        2,
      ]);

      const result = await service.getReservations(query, currentUserId);

      expect(result).toBeInstanceOf(GetReservationsResponse);
      expect(result.reservations.length).toBe(2);
      expect(result.metadata.total).toBe(2);

      const firstItem = result.reservations[0];
      expect(firstItem.reservationId).toBe(101);
      expect(firstItem.isHost).toBe(true);
      expect(firstItem.status).toBe(UserReservationStatus.DEFAULT);
    });

    it('status=after 필터가 있을 때 예정된 예약만 반환해야 한다', async () => {
      const query = Object.assign(new GetReservationsQueryDto(), {
        page: 1,
        limit: 10,
        order: OrderCondition.DESC,
        status: 'after',
      });
      const upcomingReservation = [mockUserReservations[0]];
      (userReservationRepository.findAndCount as jest.Mock).mockResolvedValue([
        upcomingReservation,
        1,
      ]);

      const result = await service.getReservations(query, currentUserId);

      expect(result.reservations.length).toBe(1);
      expect(result.metadata.total).toBe(1);
      expect(result.reservations[0].title).toBe('예정된 예약');
    });

    it('status=before 필터가 있을 때 지난 예약만 반환해야 한다', async () => {
      const query = Object.assign(new GetReservationsQueryDto(), {
        page: 1,
        limit: 10,
        order: OrderCondition.DESC,
        status: 'before',
      });
      const pastReservation = [mockUserReservations[1]];
      (userReservationRepository.findAndCount as jest.Mock).mockResolvedValue([
        pastReservation,
        1,
      ]);

      const result = await service.getReservations(query, currentUserId);

      expect(result.reservations.length).toBe(1);
      expect(result.metadata.total).toBe(1);
      expect(result.reservations[0].title).toBe('지난 예약');
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
      // 추가 헬퍼 함수들이 호출되지 않았는지 확인
      expect(
        userReservationRepository.createQueryBuilder,
      ).not.toHaveBeenCalled();
      expect(imageRepository.find).not.toHaveBeenCalled();
    });
  });
});
