import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { PresignedUrlResponse } from './response/presigned.url.response';
import { CommonResponseDecorator } from '@/common/decorator/common.response.decorator';
import { ApiAuth } from '@/common/decorator/api.auth.decorator';
import { UploadPresignedUrlRequest } from './request/upload-presigned-url.request';
import { FilesService } from './files.service';
import { AccessPresignedUrlRequest } from './request/access-presigned-url.request';

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
