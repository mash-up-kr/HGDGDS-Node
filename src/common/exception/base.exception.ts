import { HttpException } from '@nestjs/common';

type ErrorCodeObject = {
  code: number;
  message: string;
};

export class BaseException extends HttpException {
  constructor(
    status: number,
    errorCodeObject: ErrorCodeObject,
    customMessage?: string,
  ) {
    super(
      {
        code: errorCodeObject.code,
        message: customMessage || errorCodeObject.message,
      },
      status,
    );

    Error.captureStackTrace(this, new.target);
  }
}
