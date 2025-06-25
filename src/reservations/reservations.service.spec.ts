import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { DataSource } from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { User } from '@/users/entities/user.entity';
import { ReservationCategory } from '@/common/enums/reservation-category';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const mockManager = {
      getRepository: jest.fn().mockImplementation((/* _entity */) => ({
        create: jest.fn(),
        save: jest.fn(),
      })),
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
        { provide: getRepositoryToken(Reservation), useValue: {} },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should call transaction and save all entities', async () => {
    const dto: CreateReservationDto = {
      title: 'Test',
      category: '맛집' as ReservationCategory,
      reservationDatetime: new Date(),
      host: { id: 1 } as User,
      images: ['img1.png'],
    };

    await service.createReservation(dto);

    expect(dataSource.transaction).toHaveBeenCalled();
    // 추가적으로 mockManager.getRepository(Reservation).create/save 등이 호출됐는지 검증 가능
  });
});
