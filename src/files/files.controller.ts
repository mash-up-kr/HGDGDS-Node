import { CommonResponse } from '@/common/response/common.response';
import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { PresignedUrlResponse } from './response/presigned.url.response';
import { CommonResponseDecorator } from '@/common/decorator/common.response.decorator';
import { ApiAuth } from '@/common/decorator/api.auth.decorator';
import { UploadPresignedUrlRequest } from './request/upload-presigned-url.request';
import { AccessPresignedUrlRequest } from './request/access-presigned-url.request';

@ApiAuth()
@ApiTags('Files')
@Controller('files')
export class FilesController {
  @Post('presigned-url/upload')
  @ApiOperation({
    summary: '업로드용 s3 presigned URL 생성',
  })
  @CommonResponseDecorator(PresignedUrlResponse)
  @ApiBody({
    type: UploadPresignedUrlRequest,
  })
  getUploadPresignedUrl() {
    return new CommonResponse(200, 'OK', {
      url: 'https://example.com/presigned-url',
    });
  }

  @Post('presigned-url/access/:path')
  @ApiOperation({
    summary: '조회용 s3 presigned URL 생성',
  })
  @CommonResponseDecorator(PresignedUrlResponse)
  @ApiBody({
    type: AccessPresignedUrlRequest,
  })
  getAccessPresignedUrl() {
    return new CommonResponse(200, 'OK', {
      url: 'https://example.com/presigned-url',
    });
  }
}
