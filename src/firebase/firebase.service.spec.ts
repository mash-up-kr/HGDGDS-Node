import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from './firebase.service';
import * as firebaseAdmin from 'firebase-admin';
import {
  InvalidFcmTokenException,
  FirebaseServiceUnavailableException,
  NotificationSendFailedException,
  EmptyTokenListException,
} from '@/common/exception/firebase.exception';

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

    it('빈 토큰이면 InvalidFcmTokenException을 던져야 한다', async () => {
      await expect(
        service.sendNotification('', title, message),
      ).rejects.toThrow(InvalidFcmTokenException);

      expect(mockSend).not.toHaveBeenCalled();
    });

    it('null 토큰이면 InvalidFcmTokenException을 던져야 한다', async () => {
      await expect(
        service.sendNotification(null as any, title, message),
      ).rejects.toThrow(InvalidFcmTokenException);

      expect(mockSend).not.toHaveBeenCalled();
    });

    it('문자열이 아닌 토큰이면 InvalidFcmTokenException을 던져야 한다', async () => {
      await expect(
        service.sendNotification(123 as any, title, message),
      ).rejects.toThrow(InvalidFcmTokenException);

      expect(mockSend).not.toHaveBeenCalled();
    });

    it('invalid-registration-token 에러가 발생하면 InvalidFcmTokenException을 던져야 한다', async () => {
      const firebaseError = {
        code: 'messaging/invalid-registration-token',
        message: 'Invalid registration token',
      };
      mockSend.mockRejectedValue(firebaseError);

      await expect(
        service.sendNotification(validToken, title, message),
      ).rejects.toThrow(InvalidFcmTokenException);
    });

    it('registration-token-not-registered 에러가 발생하면 InvalidFcmTokenException을 던져야 한다', async () => {
      const firebaseError = {
        code: 'messaging/registration-token-not-registered',
        message: 'Registration token not registered',
      };
      mockSend.mockRejectedValue(firebaseError);

      await expect(
        service.sendNotification(validToken, title, message),
      ).rejects.toThrow(InvalidFcmTokenException);
    });

    it('third-party-auth-error 에러가 발생하면 FirebaseServiceUnavailableException을 던져야 한다', async () => {
      const firebaseError = {
        code: 'messaging/third-party-auth-error',
        message: 'Third party authentication error',
      };
      mockSend.mockRejectedValue(firebaseError);

      await expect(
        service.sendNotification(validToken, title, message),
      ).rejects.toThrow(FirebaseServiceUnavailableException);
    });

    it('authentication-error 에러가 발생하면 FirebaseServiceUnavailableException을 던져야 한다', async () => {
      const firebaseError = {
        code: 'messaging/authentication-error',
        message: 'Authentication error',
      };
      mockSend.mockRejectedValue(firebaseError);

      await expect(
        service.sendNotification(validToken, title, message),
      ).rejects.toThrow(FirebaseServiceUnavailableException);
    });

    it('알 수 없는 에러가 발생하면 NotificationSendFailedException을 던져야 한다', async () => {
      const unknownError = new Error('Unknown error');
      mockSend.mockRejectedValue(unknownError);

      await expect(
        service.sendNotification(validToken, title, message),
      ).rejects.toThrow(NotificationSendFailedException);
    });

    it('Firebase 에러 코드가 없는 경우 NotificationSendFailedException을 던져야 한다', async () => {
      const errorWithoutCode = { message: 'Error without code' };
      mockSend.mockRejectedValue(errorWithoutCode);

      await expect(
        service.sendNotification(validToken, title, message),
      ).rejects.toThrow(NotificationSendFailedException);
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

    it('URL이 있을 때 포함하여 멀티캐스트 알림을 전송해야 한다', async () => {
      const mockBatchResponse = {
        successCount: 2,
        failureCount: 0,
        responses: [
          { success: true, messageId: 'msg1' },
          { success: true, messageId: 'msg2' },
        ],
      };
      const testUrl = 'https://test.com';
      mockSendEachForMulticast.mockResolvedValue(mockBatchResponse);

      const result = await service.sendMulticastNotification(
        validTokens,
        title,
        message,
        testUrl,
      );

      expect(mockSendEachForMulticast).toHaveBeenCalledWith({
        tokens: validTokens,
        notification: {
          title,
          body: message,
        },
        url: testUrl,
      });
      expect(result).toEqual(mockBatchResponse);
    });

    it('빈 토큰 배열이면 EmptyTokenListException을 던져야 한다', async () => {
      await expect(
        service.sendMulticastNotification([], title, message),
      ).rejects.toThrow(EmptyTokenListException);

      expect(mockSendEachForMulticast).not.toHaveBeenCalled();
    });

    it('third-party-auth-error 에러가 발생하면 FirebaseServiceUnavailableException을 던져야 한다', async () => {
      const firebaseError = {
        code: 'messaging/third-party-auth-error',
        message: 'Third party authentication error',
      };
      mockSendEachForMulticast.mockRejectedValue(firebaseError);

      await expect(
        service.sendMulticastNotification(validTokens, title, message),
      ).rejects.toThrow(FirebaseServiceUnavailableException);
    });

    it('authentication-error 에러가 발생하면 FirebaseServiceUnavailableException을 던져야 한다', async () => {
      const firebaseError = {
        code: 'messaging/authentication-error',
        message: 'Authentication error',
      };
      mockSendEachForMulticast.mockRejectedValue(firebaseError);

      await expect(
        service.sendMulticastNotification(validTokens, title, message),
      ).rejects.toThrow(FirebaseServiceUnavailableException);
    });

    it('알 수 없는 에러가 발생하면 NotificationSendFailedException을 던져야 한다', async () => {
      const unknownError = new Error('Unknown error');
      mockSendEachForMulticast.mockRejectedValue(unknownError);

      await expect(
        service.sendMulticastNotification(validTokens, title, message),
      ).rejects.toThrow(NotificationSendFailedException);
    });

    it('Firebase 에러 코드가 없는 경우 NotificationSendFailedException을 던져야 한다', async () => {
      const errorWithoutCode = { message: 'Error without code' };
      mockSendEachForMulticast.mockRejectedValue(errorWithoutCode);

      await expect(
        service.sendMulticastNotification(validTokens, title, message),
      ).rejects.toThrow(NotificationSendFailedException);
    });

    it('일부 성공, 일부 실패한 배치 응답을 올바르게 반환해야 한다', async () => {
      const mockBatchResponse = {
        successCount: 1,
        failureCount: 1,
        responses: [
          { success: true, messageId: 'msg1' },
          {
            success: false,
            error: { code: 'messaging/invalid-registration-token' },
          },
        ],
      };
      mockSendEachForMulticast.mockResolvedValue(mockBatchResponse);

      const result = await service.sendMulticastNotification(
        validTokens,
        title,
        message,
      );

      expect(result).toEqual(mockBatchResponse);
      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(1);
    });
  });
});
