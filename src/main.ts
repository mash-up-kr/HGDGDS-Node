import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { swaggerConfig } from '@/app.swagger';
import { nestConfig } from '@/app.config';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });

  nestConfig(app);
  swaggerConfig(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
