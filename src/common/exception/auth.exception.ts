import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ERROR_CODES } from '../constants/error-codes';

export class DuplicateDeviceException extends BaseException {
  constructor() {
    super(HttpStatus.BAD_REQUEST, ERROR_CODES.DUPLICATE_DEVICE);
  }
}

export class ValidationFailedException extends BaseException {
  constructor(customMessage?: string) {
    super(
      HttpStatus.UNPROCESSABLE_ENTITY,
      ERROR_CODES.VALIDATION_FAILED,
      customMessage,
    );
  }
}

export class UserNotFoundException extends BaseException {
  constructor() {
    super(HttpStatus.NOT_FOUND, ERROR_CODES.USER_NOT_FOUND);
  }
}

export class InvalidTokenException extends BaseException {
  constructor() {
    super(HttpStatus.UNAUTHORIZED, ERROR_CODES.INVALID_TOKEN);
  }
}
