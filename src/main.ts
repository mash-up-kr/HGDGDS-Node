import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { swaggerConfig } from '@/app.swagger';
import { nestConfig } from '@/app.config';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { Logger } from 'nestjs-pino';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useLogger(app.get(Logger));

  nestConfig(app);
  swaggerConfig(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
