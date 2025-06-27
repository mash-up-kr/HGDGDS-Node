import { HttpStatus } from '@nestjs/common';
import { ERROR_CODES } from '../constants/error-codes';
import { BaseException } from './base.exception';

export class ReservationNotFoundException extends BaseException {
  constructor() {
    super(HttpStatus.NOT_FOUND, ERROR_CODES.RESERVATION_NOT_FOUND);
  }
}

export class ReservationFullException extends BaseException {
  constructor() {
    super(HttpStatus.BAD_REQUEST, ERROR_CODES.RESERVATION_FULL);
  }
}

export class TooManyImagesException extends BaseException {
  constructor() {
    super(HttpStatus.BAD_REQUEST, ERROR_CODES.TOO_MANY_IMAGES);
  }
}

export class ReservationAlreadyJoinedException extends BaseException {
  constructor() {
    super(HttpStatus.BAD_REQUEST, ERROR_CODES.ALREADY_JOINED);
  }
}
