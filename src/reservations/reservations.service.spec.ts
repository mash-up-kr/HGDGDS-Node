import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { User } from '@/users/entities/user.entity';
import { ReservationCategory } from '@/common/enums/reservation-category';
import { Image } from '@/images/entities/images.entity';
import { UserReservation } from './entities/user-reservation.entity';
import { OrderCondition } from '@/common';
import { CursorPageOptionsDto } from '@/reservations/dto/request/cursor-page-options-dto';
import { CursorPageDto } from '@/reservations/dto/response/cursor-page.dto';
import { CursorPageMetaDto } from '@/reservations/dto/response/cursor-page-meta.dto';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let dataSource: DataSource;
  let reservationRepository: Repository<Reservation>;
  let mockQueryBuilder: Partial<SelectQueryBuilder<Reservation>>;

  describe('createReservation', () => {
    it('should call transaction and save all entities', async () => {
      const dto: CreateReservationDto = {
        title: 'Test',
        category: 'FOOD' as ReservationCategory,
        reservationDatetime: new Date(),
        host: { id: 1 } as User,
        images: ['img1.png'],
      };

      await service.createReservation(dto);

      expect(dataSource.transaction).toHaveBeenCalled();
    });
  });

  beforeEach(async () => {
    const mockReservation = { id: 123 } as Reservation;

    // Mock QueryBuilder
    mockQueryBuilder = {
      createQueryBuilder: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getCount: jest.fn(),
    };

    const mockReservationRepository = {
      create: jest.fn().mockReturnValue(mockReservation),
      save: jest.fn().mockResolvedValue(mockReservation),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
    };

    const mockManager = {
      getRepository: jest.fn().mockImplementation((entity) => {
        if (entity === Reservation) {
          return {
            create: jest.fn().mockReturnValue(mockReservation),
            save: jest.fn().mockResolvedValue(mockReservation),
            findOne: jest.fn(),
          };
        }
        if (entity === Image) {
          return {
            create: jest
              .fn()
              .mockImplementation((img: Partial<Image>): Partial<Image> => img),
            save: jest.fn().mockResolvedValue(undefined),
          };
        }
        return {
          create: jest.fn(),
          save: jest.fn(),
        };
      }),
    };

    const mockDataSource = {
      transaction: jest.fn(
        async (
          cb: (manager: typeof mockManager) => Promise<any>,
        ): Promise<any> => {
          return cb(mockManager);
        },
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: DataSource, useValue: mockDataSource },
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
        { provide: getRepositoryToken(UserReservation), useValue: {} },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    dataSource = module.get<DataSource>(DataSource);
    reservationRepository = module.get<Repository<Reservation>>(
      getRepositoryToken(Reservation),
    );
  });

  describe('getReservations', () => {
    const mockReservations = [
      {
        id: 1, // 서비스에서 cursor로 사용하는 id 필드 추가
        reservationId: 1,
        title: '매쉬업 아구찜 직팬 모임',
        category: ReservationCategory.FOOD,
        reservationDatetime: '2025-07-11T19:00:00+09:00',
        participantCount: 3,
        maxParticipants: 20,
        hostId: 1,
        hostNickname: '서연',
        images: ['path/image1.jpg'],
        userStatus: 'default',
        isHost: false,
      },
      {
        id: 2, // 서비스에서 cursor로 사용하는 id 필드 추가
        reservationId: 2,
        title: '매쉬업 아구찜 직팬 모임',
        category: ReservationCategory.SPORTS,
        reservationDatetime: '2025-07-11T19:00:00+09:00',
        participantCount: 3,
        maxParticipants: 20,
        hostId: 2,
        hostNickname: '서연',
        images: ['path/image1.jpg'],
        userStatus: 'default',
        isHost: true,
      },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return reservations with pagination metadata when no cursor provided', async () => {
      // Arrange
      const query: CursorPageOptionsDto = {
        limit: 10,
        order: OrderCondition.DESC,
      };

      // totalCountQueryBuilder를 위한 별도 mock 설정
      const mockTotalCountQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
      };

      (reservationRepository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(mockQueryBuilder) // main query
        .mockReturnValueOnce(mockTotalCountQueryBuilder); // count query

      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(
        mockReservations,
      );

      // Act
      const result = await service.getReservations(query);

      // Assert
      expect(result).toBeInstanceOf(CursorPageDto);
      expect(result.reservations).toEqual(mockReservations);
      expect(result.metadata).toBeInstanceOf(CursorPageMetaDto);
      expect(result.metadata.total).toBe(2);
      expect(result.metadata.take).toBe(10);
      expect(result.metadata.hasNextData).toBe(false);
      expect(result.metadata.cursor).toBeNull();
    });

    it('should filter reservations by status "before"', async () => {
      // Arrange
      const query: CursorPageOptionsDto = {
        limit: 10,
        order: OrderCondition.DESC,
        status: 'before',
      };

      const mockTotalCountQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
      };

      (reservationRepository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(mockQueryBuilder)
        .mockReturnValueOnce(mockTotalCountQueryBuilder);

      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(
        mockReservations,
      );

      // Act
      await service.getReservations(query);

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'reservation.reservationDatetime < :now',
        { now: expect.any(Date) },
      );
      expect(mockTotalCountQueryBuilder.andWhere).toHaveBeenCalledWith(
        'reservation.reservationDatetime < :now',
        { now: expect.any(Date) },
      );
    });

    it('should filter reservations by status "after"', async () => {
      // Arrange
      const query: CursorPageOptionsDto = {
        limit: 10,
        order: OrderCondition.DESC,
        status: 'after',
      };

      const mockTotalCountQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
      };

      (reservationRepository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(mockQueryBuilder)
        .mockReturnValueOnce(mockTotalCountQueryBuilder);

      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(
        mockReservations,
      );

      // Act
      await service.getReservations(query);

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'reservation.reservationDatetime >= :now',
        { now: expect.any(Date) },
      );
      expect(mockTotalCountQueryBuilder.andWhere).toHaveBeenCalledWith(
        'reservation.reservationDatetime >= :now',
        { now: expect.any(Date) },
      );
    });

    it('should apply cursor-based pagination when cursor is provided', async () => {
      // Arrange
      const query: CursorPageOptionsDto = {
        cursor: 5,
        limit: 10,
        order: OrderCondition.DESC,
      };

      const mockCursorReservation = {
        id: 5,
        reservationDatetime: new Date('2024-03-15T12:00:00Z'),
      } as Reservation;

      const mockTotalCountQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
      };

      (reservationRepository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(mockQueryBuilder)
        .mockReturnValueOnce(mockTotalCountQueryBuilder);

      (reservationRepository.findOne as jest.Mock).mockResolvedValue(
        mockCursorReservation,
      );
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(
        mockReservations,
      );

      // Act
      await service.getReservations(query);

      // Assert
      expect(reservationRepository.findOne).toHaveBeenCalledWith({
        select: ['reservationDatetime', 'id'],
        where: { id: 5 },
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(reservation.reservationDatetime < :cursorDatetime OR (reservation.reservationDatetime = :cursorDatetime AND reservation.id < :cursorId))',
        {
          cursorDatetime: mockCursorReservation.reservationDatetime,
          cursorId: 5,
        },
      );
    });

    it('should apply ascending order cursor pagination', async () => {
      // Arrange
      const query: CursorPageOptionsDto = {
        cursor: 5,
        limit: 10,
        order: OrderCondition.ASC,
      };

      const mockCursorReservation = {
        id: 5,
        reservationDatetime: new Date('2024-03-15T12:00:00Z'),
      } as Reservation;

      const mockTotalCountQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
      };

      (reservationRepository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(mockQueryBuilder)
        .mockReturnValueOnce(mockTotalCountQueryBuilder);

      (reservationRepository.findOne as jest.Mock).mockResolvedValue(
        mockCursorReservation,
      );
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(
        mockReservations,
      );

      // Act
      await service.getReservations(query);

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(reservation.reservationDatetime > :cursorDatetime OR (reservation.reservationDatetime = :cursorDatetime AND reservation.id > :cursorId))',
        {
          cursorDatetime: mockCursorReservation.reservationDatetime,
          cursorId: 5,
        },
      );
    });

    it('should return empty result when cursor reservation is not found', async () => {
      // Arrange
      const query: CursorPageOptionsDto = {
        cursor: 999,
        limit: 10,
        order: OrderCondition.DESC,
      };

      (reservationRepository.findOne as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await service.getReservations(query);

      // Assert
      expect(result.reservations).toEqual([]);
      expect(result.metadata.total).toBe(0);
      expect(result.metadata.hasNextData).toBe(false);
      expect(result.metadata.cursor).toBeNull();
    });

    it('should set hasNextData to true and cursor when limit is reached', async () => {
      // Arrange
      const query: CursorPageOptionsDto = {
        limit: 2,
        order: OrderCondition.DESC,
      };

      const mockTotalCountQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(10),
      };

      (reservationRepository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(mockQueryBuilder)
        .mockReturnValueOnce(mockTotalCountQueryBuilder);

      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(
        mockReservations,
      );

      // Act
      const result = await service.getReservations(query);

      // Assert
      expect(result.metadata.hasNextData).toBe(true);
      expect(result.metadata.cursor).toBe(2); // 마지막 reservation의 id
      expect(result.metadata.total).toBe(10);
      expect(result.metadata.take).toBe(2);
    });

    it('should build query with correct joins and selects', async () => {
      // Arrange
      const query: CursorPageOptionsDto = {
        limit: 10,
        order: OrderCondition.DESC,
      };

      const mockTotalCountQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };

      (reservationRepository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(mockQueryBuilder)
        .mockReturnValueOnce(mockTotalCountQueryBuilder);

      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue([]);

      // Act
      await service.getReservations(query);

      // Assert
      expect(reservationRepository.createQueryBuilder).toHaveBeenCalledWith(
        'reservation',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'reservation.host',
        'host',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'reservation.images',
        'images',
      );
      expect(mockQueryBuilder.select).toHaveBeenCalledWith([
        'reservation.id',
        'reservation.title',
        'reservation.category',
        'reservation.reservationDatetime',
        'reservation.participantCount',
        'reservation.maxParticipants',
        'host.id',
        'host.nickname',
        'host.profileImageCode',
        'images.s3FilePath',
      ]);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'reservation.reservationDatetime',
        OrderCondition.DESC,
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'reservation.id',
        OrderCondition.DESC,
      );
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should validate CursorPageOptionsDto properties', async () => {
      // Arrange
      const query: CursorPageOptionsDto = {
        cursor: 1,
        limit: 20,
        order: OrderCondition.ASC,
        status: 'before',
      };

      const mockCursorReservation = {
        id: 1,
        reservationDatetime: new Date('2024-03-15T12:00:00Z'),
      } as Reservation;

      const mockTotalCountQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };

      (reservationRepository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(mockQueryBuilder)
        .mockReturnValueOnce(mockTotalCountQueryBuilder);

      (reservationRepository.findOne as jest.Mock).mockResolvedValue(
        mockCursorReservation,
      );
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await service.getReservations(query);

      // Assert
      expect(result.metadata.take).toBe(20);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'reservation.reservationDatetime',
        OrderCondition.ASC,
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'reservation.id',
        OrderCondition.ASC,
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'reservation.reservationDatetime < :now',
        { now: expect.any(Date) },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(reservation.reservationDatetime > :cursorDatetime OR (reservation.reservationDatetime = :cursorDatetime AND reservation.id > :cursorId))',
        {
          cursorDatetime: mockCursorReservation.reservationDatetime,
          cursorId: 1,
        },
      );
    });
  });
});
