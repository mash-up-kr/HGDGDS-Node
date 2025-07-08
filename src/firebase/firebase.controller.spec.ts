import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseController } from './firebase.controller';
import { FirebaseService } from './firebase.service';
import { FcmTestDto } from '@/firebase/dto/firebase-test.dto';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { InvalidFcmTokenException } from '@/common/exception/firebase.exception';

describe('FirebaseController', () => {
  let controller: FirebaseController;
  let firebaseService: FirebaseService;

  const mockFirebaseService = {
    sendNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FirebaseController],
      providers: [
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    controller = module.get<FirebaseController>(FirebaseController);
    firebaseService = module.get<FirebaseService>(FirebaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendTestNotification', () => {
    it('should send test notification successfully', async () => {
      const dto: FcmTestDto = {
        token: 'test-fcm-token-123',
      };
      const expectedResult = {
        success: true,
        messageId: 'test-message-id',
      };

      mockFirebaseService.sendNotification.mockResolvedValue(expectedResult);

      const result = await controller.sendTestNotification(dto);

      expect(firebaseService.sendNotification).toHaveBeenCalledWith(
        dto.token,
        'FCM 테스트 알림',
        '테스트 알림이 성공적으로 전송되었습니다',
        '',
      );
      expect(firebaseService.sendNotification).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should handle service error', async () => {
      const dto: FcmTestDto = {
        token: 'invalid-token',
      };
      const errorMessage = 'Invalid FCM token';

      mockFirebaseService.sendNotification.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.sendTestNotification(dto)).rejects.toThrow(
        errorMessage,
      );
      expect(firebaseService.sendNotification).toHaveBeenCalledWith(
        dto.token,
        'FCM 테스트 알림',
        '테스트 알림이 성공적으로 전송되었습니다',
        '',
      );
    });

    it('should call service with correct parameters', async () => {
      const dto: FcmTestDto = {
        token: 'another-test-token',
      };

      mockFirebaseService.sendNotification.mockResolvedValue({ success: true });

      await controller.sendTestNotification(dto);

      expect(firebaseService.sendNotification).toHaveBeenCalledWith(
        'another-test-token',
        'FCM 테스트 알림',
        '테스트 알림이 성공적으로 전송되었습니다',
        '',
      );
    });
  });
});

describe('FirebaseController (e2e)', () => {
  let app: INestApplication;
  let firebaseService: FirebaseService;

  const mockFirebaseService = {
    sendNotification: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FirebaseController],
      providers: [
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    firebaseService = moduleFixture.get<FirebaseService>(FirebaseService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('/firebase/test (POST) - should send test notification', async () => {
    const dto: FcmTestDto = {
      token: 'test-token-123',
    };
    const expectedResponse = {
      success: true,
      messageId: 'test-message-id',
    };

    mockFirebaseService.sendNotification.mockResolvedValue(expectedResponse);

    const response = await request(app.getHttpServer())
      .post('/firebase/test')
      .send(dto)
      .expect(201);

    expect(response.body).toEqual(expectedResponse);
    expect(firebaseService.sendNotification).toHaveBeenCalledWith(
      dto.token,
      'FCM 테스트 알림',
      '테스트 알림이 성공적으로 전송되었습니다',
      '',
    );
    expect(firebaseService.sendNotification).toHaveBeenCalledTimes(1);
  });

  it('/firebase/test (POST) - should handle invalid token', async () => {
    const dto: FcmTestDto = {
      token: 'invalid-token',
    };

    mockFirebaseService.sendNotification.mockRejectedValue(
      new InvalidFcmTokenException(),
    );

    const response = await request(app.getHttpServer())
      .post('/firebase/test')
      .send(dto)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(firebaseService.sendNotification).toHaveBeenCalledWith(
      dto.token,
      'FCM 테스트 알림',
      '테스트 알림이 성공적으로 전송되었습니다',
      '',
    );
  });
});
