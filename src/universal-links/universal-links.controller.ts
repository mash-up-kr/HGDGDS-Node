import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '@/common/decorator/public.decorator';

@Controller()
export class UniversalLinksController {
  @Get('invite')
  @Public()
  handleInviteLink(
    @Query('reservationId') reservationId: string,
    @Res() res: Response,
  ) {
    return res.redirect(302, 'https://apps.apple.com/kr/app/id6748375826');
  }
}
