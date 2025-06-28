import { HttpStatus } from '@nestjs/common';
import { BaseException } from '@/common/exception/base.exception';
import { ERROR_CODES } from '@/common/constants/error-codes';

export class InvalidServiceAccountException extends BaseException {
  constructor() {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INVALID_SERVICE_ACCOUNT,
    );
  }
}

export class FirebaseInitializationFailedException extends BaseException {
  constructor() {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ERROR_CODES.FIREBASE_INITIALIZATION_FAILED,
    );
  }
}

export class InvalidFcmTokenException extends BaseException {
  constructor() {
    super(HttpStatus.BAD_REQUEST, ERROR_CODES.INVALID_FCM_TOKEN);
  }
}

export class FirebaseServiceUnavailableException extends BaseException {
  constructor() {
    super(
      HttpStatus.SERVICE_UNAVAILABLE,
      ERROR_CODES.FIREBASE_SERVICE_UNAVAILABLE,
    );
  }
}

export class NotificationSendFailedException extends BaseException {
  constructor() {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ERROR_CODES.NOTIFICATION_SEND_FAILED,
    );
  }
}

export class EmptyTokenListException extends BaseException {
  constructor() {
    super(HttpStatus.BAD_REQUEST, ERROR_CODES.EMPTY_TOKEN_LIST);
  }
}
