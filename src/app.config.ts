import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CommonResponseInterceptor } from './common/interceptor';
import { ValidationFailedException } from './common/exception/request-parsing.exception';
import { TimezoneInterceptor } from './common/interceptor/timezone.interceptor';

export function nestConfig(app: INestApplication) {
  process.env.TZ = 'Asia/Seoul';

  const reflector = app.get<Reflector>(Reflector);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        const message = errors
          .map((error) => {
            return Object.values(error.constraints ?? {}).join(', ');
          })
          .join(', ');
        return new ValidationFailedException(message);
      },
    }),
  );

  app.useGlobalInterceptors(
    new CommonResponseInterceptor(),
    new TimezoneInterceptor(),
    new ClassSerializerInterceptor(reflector),
  );
}
