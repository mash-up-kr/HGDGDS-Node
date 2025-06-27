import { HttpException } from '@nestjs/common';

export type ErrorCodeObject = {
  code: number;
  message: string;
};

export class BaseException extends HttpException {
  public description: string;

  constructor(
    status: number,
    errorCodeObject: ErrorCodeObject,
    customMessage?: string,
    description?: string,
  ) {
    super(
      {
        code: errorCodeObject.code,
        message: customMessage || errorCodeObject.message,
      },
      status,
    );
    this.description = description || errorCodeObject.message;

    Error.captureStackTrace(this, new.target);
  }
}
