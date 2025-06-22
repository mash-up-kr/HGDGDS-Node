const mockMessagingObject = {
  send: jest.fn(),
  sendEachForMulticast: jest.fn(),
};

const mockFirebaseAdmin = {
  credential: {
    cert: jest.fn(),
  },
  messaging: jest.fn(() => mockMessagingObject),
  initializeApp: jest.fn(),
  apps: [],
};

jest.mock('firebase-admin', () => mockFirebaseAdmin);

jest.mock('@/firebase/firebase.config', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';
import firebaseConfig from '@/firebase/firebase.config';

describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebaseService],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);
  });

  it('서비스가 정상적으로 생성되어야 한다', () => {
    expect(service).toBeDefined();
  });

  describe('생성자 (constructor)', () => {
    it('서비스가 생성될 때 Firebase Admin SDK가 초기화되어야 한다', () => {
      expect(admin.initializeApp).toHaveBeenCalledTimes(1);
      expect(admin.credential.cert).toHaveBeenCalledTimes(1);
      expect(firebaseConfig).toHaveBeenCalledTimes(1);
    });
  });

  describe('fcm (단일 푸시 알림)', () => {
    const token = 'test-device-token';
    const title = '테스트 제목';
    const message = '테스트 메시지';

    it('푸시 전송에 성공하고 성공 응답 객체를 반환해야 한다', async () => {
      const mockSuccessResponse = { messageId: 'mock-message-id' };
      mockMessagingObject.send.mockResolvedValue(mockSuccessResponse);

      const result = await service.fcm(token, title, message);

      expect(mockMessagingObject.send).toHaveBeenCalledWith({
        token,
        notification: { title, body: message },
      });
      expect(result).toEqual({ sent_message: mockSuccessResponse });
    });

    it('푸시 전송에 실패하고 에러 객체를 반환해야 한다', async () => {
      const mockError = { code: 'messaging/invalid-argument' };
      mockMessagingObject.send.mockRejectedValue(mockError);

      const result = await service.fcm(token, title, message);

      expect(result).toEqual({ error: mockError.code });
    });
  });

  describe('multiFcm (다중 푸시 알림)', () => {
    const tokens = ['token1', 'token2'];
    const title = '다중 전송 제목';
    const message = '다중 전송 메시지';

    it('다중 푸시를 성공적으로 보내고 그 결과를 반환해야 한다', async () => {
      const mockMulticastResponse = { successCount: 2, failureCount: 0 };
      mockMessagingObject.sendEachForMulticast.mockResolvedValue(
        mockMulticastResponse,
      );

      const result = await service.multiFcm(tokens, title, message);

      expect(mockMessagingObject.sendEachForMulticast).toHaveBeenCalledWith({
        tokens,
        notification: { title, body: message },
      });
      expect(result).toEqual(mockMulticastResponse);
    });

    it('토큰 배열이 비어있을 경우, API를 호출하지 않고 에러를 반환해야 한다', async () => {
      const result = await service.multiFcm([], title, message);

      expect(mockMessagingObject.sendEachForMulticast).not.toHaveBeenCalled();
      expect(result).toEqual({ error: 'Tokens are empty' });
    });
  });
});
