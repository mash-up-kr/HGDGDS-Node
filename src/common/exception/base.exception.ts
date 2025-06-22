import { HttpException } from '@nestjs/common';

type ErrorCodeObject = {
  code: string;
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
        statusCode: status,
        errorCode: errorCodeObject.code,
        message: customMessage || errorCodeObject.message,
        timestamp: new Date().toISOString(),
      },
      status,
    );

    Error.captureStackTrace(this, new.target);
  }
}
