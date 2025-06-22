import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ERROR_CODES } from '../constants/error-codes';

export class CustomBadRequestException extends BaseException {
  constructor(message?: string) {
    super(HttpStatus.BAD_REQUEST, ERROR_CODES.BAD_REQUEST, message);
  }
}
