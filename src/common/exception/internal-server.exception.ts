import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { AppMessage } from './error-message.enum';

export class InternalServerException extends BaseException {
  constructor(message?: string) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      message ? message : AppMessage.TEST_EXCEPTION,
    );
  }
}
