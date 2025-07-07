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

export class NoEditPermissionException extends BaseException {
  constructor() {
    super(HttpStatus.FORBIDDEN, ERROR_CODES.NO_EDIT_PERMISSION);
  }
}

export class CannotEditStartedException extends BaseException {
  constructor() {
    super(HttpStatus.CONFLICT, ERROR_CODES.CANNOT_EDIT_STARTED);
  }
}

export class InvalidTimeUpdateException extends BaseException {
  constructor() {
    super(HttpStatus.BAD_REQUEST, ERROR_CODES.INVALID_TIME_UPDATE);
  }
}

export class ReservationTimeNotReachedException extends BaseException {
  constructor() {
    super(HttpStatus.BAD_REQUEST, ERROR_CODES.RESERVATION_TIME_NOT_REACHED);
  }
}

export class UserReservationNotFoundException extends BaseException {
  constructor() {
    super(HttpStatus.FORBIDDEN, ERROR_CODES.USER_RESERVATION_NOT_FOUND);
  }
}

export class ReservationNotDoneException extends BaseException {
  constructor() {
    super(HttpStatus.BAD_REQUEST, ERROR_CODES.RESERVATION_NOT_DONE);
  }
}

export class ReservationResultAlreadyExistsException extends BaseException {
  constructor() {
    super(HttpStatus.BAD_REQUEST, ERROR_CODES.RESULT_ALREADY_EXIST);
  }
}
