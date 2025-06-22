import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { PresignedUrlResponse } from './response/presigned.url.response';
import { CommonResponseDecorator } from '@/common/decorator/common.response.decorator';
import { ApiAuth } from '@/common/decorator/api.auth.decorator';
import { UploadPresignedUrlRequest } from './request/upload-presigned-url.request';
import { FilesService } from './files.service';
import { AccessPresignedUrlRequest } from './request/access-presigned-url.request';
import { ErrorResponseDto } from '@/common/dto/response/error-response.dto';
import { ERROR_CODES } from '@/common/constants/error-codes';

@ApiAuth()
@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly fileService: FilesService) {}

  @Post('presigned-url/upload')
  @ApiOperation({
    summary: '업로드용 s3 presigned URL 생성',
  })
  @CommonResponseDecorator(PresignedUrlResponse)
  @ApiBody({
    type: UploadPresignedUrlRequest,
  })
  @ApiResponse({
    status: 400,
    description: 'filePrefix validation 실패',
    type: ErrorResponseDto,
    example: {
      code: '400',
      message: '유효한 filePrefix가 아닙니다.',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'filePrefix validation 실패',
    type: ErrorResponseDto,
    example: {
      code: ERROR_CODES.BAD_REQUEST.code,
      message: '유효한 filePrefix가 아닙니다.',
    },
  })
  @ApiResponse({
    status: 500,
    description: '내부 서버 에러',
    type: ErrorResponseDto,
    example: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR.code,
      message: ERROR_CODES.INTERNAL_SERVER_ERROR.message,
    },
  })
  async getUploadPresignedUrl(
    @Body() body: UploadPresignedUrlRequest,
  ): Promise<PresignedUrlResponse> {
    const res = await this.fileService.getUploadPresignedUrl(
      body.filePrefix,
      body.fileExtension,
    );
    return res;
  }

  @Post('presigned-url/access')
  @ApiOperation({
    summary: '조회용 s3 presigned URL 생성',
  })
  @CommonResponseDecorator()
  @ApiBody({
    type: AccessPresignedUrlRequest,
  })
  async getAccessPresignedUrl(
    @Body() body: AccessPresignedUrlRequest,
  ): Promise<string> {
    const url = await this.fileService.getAccessPresignedUrl(body.filePath);
    return url;
  }
}
