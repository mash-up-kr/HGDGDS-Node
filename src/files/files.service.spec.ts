import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    process.env.AWS_S3_BUCKET = 'test-bucket';
    process.env.AWS_REGION = 'ap-northeast-2';
    process.env.AWS_ACCESS_KEY_ID = 'test-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';

    (S3Client as jest.Mock).mockImplementation(() => ({
      send: jest.fn(),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getUploadPresignedUrl: S3 presigned URL을 정상적으로 반환하는지', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue('mock-upload-url');
    const response = await service.getUploadPresignedUrl(
      'reservations/1/info',
      'jpeg',
    );
    expect(getSignedUrl).toHaveBeenCalled();
    expect(response.presignedUrl).toBe('mock-upload-url');
    expect(response.filePath).toMatch(
      /reservations\/1\/info\/[a-z0-9-]+\.jpeg/,
    );
  });

  it('getUploadPresignedUrl: S3 presigned URL 생성 중 에러가 발생하면 예외를 던지는지', async () => {
    (getSignedUrl as jest.Mock).mockRejectedValue(new Error('S3 error'));
    await expect(
      service.getUploadPresignedUrl('test/key.png', 'image/png'),
    ).rejects.toThrow('Presigned URL 생성에 실패했습니다.');
  });

  it('getAccessPresignedUrl: S3 presigned URL을 정상적으로 반환하는지', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue('mock-access-url');
    const url = await service.getAccessPresignedUrl('test/key.png');
    expect(getSignedUrl).toHaveBeenCalled();
    expect(url).toBe('mock-access-url');
  });

  it('getAccessPresignedUrl: S3 presigned URL 생성 중 에러가 발생하면 예외를 던지는지', async () => {
    (getSignedUrl as jest.Mock).mockRejectedValue(new Error('S3 error'));
    await expect(service.getAccessPresignedUrl('test/key.png')).rejects.toThrow(
      'Presigned URL 생성에 실패했습니다.',
    );
  });
});
