import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfileImageCodeDto } from './dto/profile-image-code.dto';
import {
  PROFILE_IMAGE_PATH_MAP,
  ProfileImageCode,
} from '@/common/enums/profile-image-code';
import { FilesService } from '@/files/files.service';
import { CommonResponseDecorator } from '@/common/decorator/common.response.decorator';

@ApiTags('Codes')
@Controller('codes')
export class CodesController {
  constructor(private readonly fileService: FilesService) {}

  @Get('profile-image-code')
  @ApiOperation({
    summary: '프로필 종류 조회 ✅',
  })
  @CommonResponseDecorator(ProfileImageCodeDto)
  async getProfileImageCodes(): Promise<ProfileImageCodeDto[]> {
    return Promise.all(
      Object.values(ProfileImageCode).map(
        async (code) =>
          new ProfileImageCodeDto(
            code,
            await this.fileService.getAccessPresignedUrl(
              PROFILE_IMAGE_PATH_MAP[code],
            ),
          ),
      ),
    );
  }
}
