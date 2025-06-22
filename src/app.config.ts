import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomBadRequestException } from './common/exception/request-parsing.exception';
import { CommonResponseInterceptor } from './common/interceptor';

export function nestConfig(app: INestApplication) {
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
        return new CustomBadRequestException(message);
      },
    }),
  );

  app.useGlobalInterceptors(
    new CommonResponseInterceptor(),
    new ClassSerializerInterceptor(reflector),
  );
}
