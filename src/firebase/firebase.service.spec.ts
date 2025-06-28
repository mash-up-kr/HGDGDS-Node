import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from './firebase.service';
import { ERROR_CODES } from '@/common/constants/error-codes';
import * as firebaseAdmin from 'firebase-admin';

const mockSend = jest.fn();
const mockSendEachForMulticast = jest.fn();

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  messaging: jest.fn(() => ({
    send: mockSend,
    sendEachForMulticast: mockSendEachForMulticast,
  })),
  apps: [],
}));

jest.mock('@/firebase/firebase.config', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    type: 'service_account',
    project_id: 'test-project',
    private_key_id: 'test-key-id',
    private_key:
      '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----\n',
    client_email: 'test@test-project.iam.gserviceaccount.com',
    client_id: 'test-client-id',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
  })),
}));

describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(async () => {
    jest.clearAllMocks();

    Object.defineProperty(firebaseAdmin, 'apps', {
      value: [],
      writable: true,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebaseService],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);
  });

  describe('sendNotification', () => {
    const validToken = 'valid-fcm-token';
    const title = 'Test Title';
    const message = 'Test Message';

    it('유효한 토큰으로 알림을 성공적으로 전송해야 한다', async () => {
      const mockMessageId = 'mock-message-id';
      mockSend.mockResolvedValue(mockMessageId);

      const result = await service.sendNotification(validToken, title, message);

      expect(mockSend).toHaveBeenCalledWith({
        token: validToken,
        notification: {
          title,
          body: message,
        },
      });
      expect(result).toEqual({ sent_message: mockMessageId });
    });

    it('빈 토큰이면 INVALID_FCM_TOKEN 에러를 반환해야 한다', async () => {
      const result = await service.sendNotification('', title, message);

      expect(result).toEqual({
        error: ERROR_CODES.INVALID_FCM_TOKEN.code,
        message: ERROR_CODES.INVALID_FCM_TOKEN.message,
      });
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('invalid-registration-token 에러가 발생하면 INVALID_FCM_TOKEN을 반환해야 한다', async () => {
      const firebaseError = {
        code: 'messaging/invalid-registration-token',
        message: 'Invalid registration token',
      };
      mockSend.mockRejectedValue(firebaseError);

      const result = await service.sendNotification(validToken, title, message);

      expect(result).toEqual({
        error: ERROR_CODES.INVALID_FCM_TOKEN.code,
        message: ERROR_CODES.INVALID_FCM_TOKEN.message,
      });
    });

    it('third-party-auth-error 에러가 발생하면 FIREBASE_SERVICE_UNAVAILABLE을 반환해야 한다', async () => {
      const firebaseError = {
        code: 'messaging/third-party-auth-error',
        message: 'Third party authentication error',
      };
      mockSend.mockRejectedValue(firebaseError);

      const result = await service.sendNotification(validToken, title, message);

      expect(result).toEqual({
        error: ERROR_CODES.FIREBASE_SERVICE_UNAVAILABLE.code,
        message: ERROR_CODES.FIREBASE_SERVICE_UNAVAILABLE.message,
      });
    });

    it('알 수 없는 에러가 발생하면 NOTIFICATION_SEND_FAILED를 반환해야 한다', async () => {
      const unknownError = new Error('Unknown error');
      mockSend.mockRejectedValue(unknownError);

      const result = await service.sendNotification(validToken, title, message);

      expect(result).toEqual({
        error: ERROR_CODES.NOTIFICATION_SEND_FAILED.code,
        message: ERROR_CODES.NOTIFICATION_SEND_FAILED.message,
      });
    });
  });

  describe('sendMulticastNotification', () => {
    const validTokens = ['token1', 'token2'];
    const title = 'Test Title';
    const message = 'Test Message';

    it('여러 토큰으로 멀티캐스트 알림을 성공적으로 전송해야 한다', async () => {
      const mockBatchResponse = {
        successCount: 2,
        failureCount: 0,
        responses: [
          { success: true, messageId: 'msg1' },
          { success: true, messageId: 'msg2' },
        ],
      };
      mockSendEachForMulticast.mockResolvedValue(mockBatchResponse);

      const result = await service.sendMulticastNotification(
        validTokens,
        title,
        message,
      );

      expect(mockSendEachForMulticast).toHaveBeenCalledWith({
        tokens: validTokens,
        notification: {
          title,
          body: message,
        },
      });
      expect(result).toEqual(mockBatchResponse);
    });

    it('빈 토큰 배열이면 EMPTY_TOKEN_LIST 에러를 반환해야 한다', async () => {
      const result = await service.sendMulticastNotification(
        [],
        title,
        message,
      );

      expect(result).toEqual({
        error: ERROR_CODES.EMPTY_TOKEN_LIST.code,
        message: ERROR_CODES.EMPTY_TOKEN_LIST.message,
      });
      expect(mockSendEachForMulticast).not.toHaveBeenCalled();
    });

    it('third-party-auth-error 에러가 발생하면 FIREBASE_SERVICE_UNAVAILABLE을 반환해야 한다', async () => {
      const firebaseError = {
        code: 'messaging/third-party-auth-error',
        message: 'Third party authentication error',
      };
      mockSendEachForMulticast.mockRejectedValue(firebaseError);

      const result = await service.sendMulticastNotification(
        validTokens,
        title,
        message,
      );

      expect(result).toEqual({
        error: ERROR_CODES.FIREBASE_SERVICE_UNAVAILABLE.code,
        message: ERROR_CODES.FIREBASE_SERVICE_UNAVAILABLE.message,
      });
    });
  });
});
