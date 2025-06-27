import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from './firebase.service';

jest.mock('./firebase.config', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}));

const mockSend = jest.fn();
const mockSendEachForMulticast = jest.fn();

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  messaging: () => ({
    send: mockSend,
    sendEachForMulticast: mockSendEachForMulticast,
  }),
  apps: [],
}));

describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebaseService],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fcm', () => {
    const testToken = 'test-fcm-token';
    const testTitle = 'Test Title';
    const testMessage = 'Test Body';

    it('FCM 메시지를 성공적으로 보내고, 올바른 응답 객체를 반환해야 한다', async () => {
      const mockSuccessResponse = { messageId: 'mock-message-id-123' };
      mockSend.mockResolvedValue(mockSuccessResponse);

      const result = await service.fcm(testToken, testTitle, testMessage);

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({
        token: testToken,
        notification: {
          title: testTitle,
          body: testMessage,
        },
      });
      expect(result).toEqual({ sent_message: mockSuccessResponse });
    });

    it('FCM 전송 중 에러가 발생하면, 포맷에 맞는 에러 객체를 반환해야 한다', async () => {
      const mockError = {
        code: 'messaging/invalid-argument',
        message:
          'The registration token is not a valid FCM registration token.',
      };
      mockSend.mockRejectedValue(mockError);

      const result = await service.fcm('invalid-token', testTitle, testMessage);

      expect(result).toEqual({
        error: mockError.code,
        message: mockError.message,
      });
    });
  });

  describe('multiFcm', () => {
    const testTokens = ['token1', 'token2', 'token3'];
    const testTitle = 'Multi-cast Title';
    const testMessage = 'Multi-cast Body';

    it('여러 토큰으로 FCM 메시지를 성공적으로 보내야 한다', async () => {
      const mockSuccessResponse = {
        successCount: 3,
        failureCount: 0,
        responses: [],
      };
      mockSendEachForMulticast.mockResolvedValue(mockSuccessResponse);

      const result = await service.multiFcm(testTokens, testTitle, testMessage);

      expect(mockSendEachForMulticast).toHaveBeenCalledTimes(1);
      expect(mockSendEachForMulticast).toHaveBeenCalledWith({
        tokens: testTokens,
        notification: {
          title: testTitle,
          body: testMessage,
        },
      });
      expect(result).toEqual(mockSuccessResponse);
    });

    it('토큰 배열이 비어있으면, FCM을 호출하지 않고 에러 객체를 즉시 반환해야 한다', async () => {
      const result = await service.multiFcm([], testTitle, testMessage);
      expect(mockSendEachForMulticast).not.toHaveBeenCalled();
      expect(result).toEqual({ error: 'Tokens are empty' });
    });

    it('multi-cast 전송 중 에러가 발생하면, 포맷에 맞는 에러 객체를 반환해야 한다', async () => {
      const mockError = {
        code: 'internal-error',
        message: 'An internal error occurred',
      };
      mockSendEachForMulticast.mockRejectedValue(mockError);

      const result = await service.multiFcm(testTokens, testTitle, testMessage);

      expect(result).toEqual({
        error: mockError.code,
        message: mockError.message,
      });
    });
  });
});
