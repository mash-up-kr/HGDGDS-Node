import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/response/error-response.dto';
import { BaseException } from '../exception/base.exception';

/**
 * Creates a NestJS Swagger API response decorator for documenting error responses based on a given exception class and its arguments.
 *
 * The generated decorator sets the HTTP status, description, response schema, and example using the provided exception.
 *
 * @param ExceptionClass - The exception class to instantiate for generating the error response metadata
 * @param args - Arguments to pass to the exception class constructor
 * @returns A decorator for documenting the error response in Swagger
 */
export function ApiErrorResponse<T extends unknown[]>(
  ExceptionClass: new (...args: T) => BaseException,
  ...args: T
) {
  const exception = new ExceptionClass(...args);
  const status = exception.getStatus();
  const { code, message } = exception.getResponse() as {
    code: number | string;
    message: string;
  };

  return applyDecorators(
    ApiResponse({
      status,
      description: exception.description || message,
      type: ErrorResponseDto,
      example: { code, message },
    }),
  );
}
