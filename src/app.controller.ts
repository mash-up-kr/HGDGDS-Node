import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from '@/app.service';
import { Public } from '@/common/decorator/public.decorator';

@Public()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('.well-known/apple-app-site-association')
  @Header('Content-Type', 'application/json')
  getAppleAppSiteAssociation() {
    return {
      applinks: {
        apps: [],
        details: [
          {
            appIDs: ['V2YNV9QV27.HGDGDS.HGDGDS-iOS'],
            components: [
              {
                '/': '/invite',
                comment: 'Matches /invite path for reservation invitations',
              },
              {
                '#': 'no_universal_links',
                exclude: true,
                comment:
                  'Matches any URL with a fragment that equals no_universal_links',
              },
            ],
          },
        ],
      },
    };
  }
}
