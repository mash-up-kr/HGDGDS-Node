import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ERROR_CODES } from '../constants/error-codes';

export class InternalServerException extends BaseException {
  constructor(message?: string) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      message,
    );
  }
}
