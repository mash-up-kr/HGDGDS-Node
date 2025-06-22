import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ERROR_CODES } from '../constants/error-codes';

export class UserNotFoundException extends BaseException {
  constructor() {
    super(HttpStatus.NOT_FOUND, ERROR_CODES.USER_NOT_FOUND);
  }
}
