import { CommonResponse } from '@/common/response/common.response';
import { Controller, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { PresignedUrlResponse } from './response/presigned.url.response';
import { CommonResponseDecorator } from '@/common/decorator/common.response.decorator';

@ApiBearerAuth()
@ApiTags('Files')
@Controller('files')
export class FilesController {
  @Post('presigned-url/upload/:path')
  @ApiOperation({
    summary: '업로드용 s3 presigned URL 생성',
  })
  @CommonResponseDecorator(PresignedUrlResponse)
  @ApiParam({
    name: 'path',
    description: `파일 저장 경로 (두 가지 종류만 가능)\n
        - 예약 상세 이미지 : /reservations/{reservation_id}/info
        - 예약 결과 이미지 : /reservations/{reservation_id}/result`,
    example: '/reservations/{reservation_id}/info',
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
  @ApiParam({
    name: 'path',
    description: '파일 path',
    example: '/reservations/{reservation_id}/info/uuid.png',
  })
  getAccessPresignedUrl() {
    return new CommonResponse(200, 'OK', {
      url: 'https://example.com/presigned-url',
    });
  }
}
