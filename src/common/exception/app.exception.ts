import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

import { ERROR_CODES } from '../constants/error-codes';

export class TestException extends BaseException {
  constructor() {
    super(HttpStatus.I_AM_A_TEAPOT, ERROR_CODES.TEST_EXCEPTION);
  }
}
