import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/response/error-response.dto';

type ErrorCodeObject = {
  message: string;
  code: string;
};

export function ApiErrorResponse(
  status: number,
  errorCodeObject: ErrorCodeObject,
) {
  return applyDecorators(
    ApiResponse({
      status,
      description: errorCodeObject.message,
      type: ErrorResponseDto,
      example: {
        code: errorCodeObject.code,
        message: errorCodeObject.message,
      },
    }),
  );
}
