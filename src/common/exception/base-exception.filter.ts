import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { BaseException } from './base.exception';
import { ErrorResponseDto } from '../dto/response/error-response.dto';

@Catch(BaseException)
export class BaseExceptionFilter implements ExceptionFilter {
  catch(exception: BaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const dto = exception.getResponse() as ErrorResponseDto;

    response.status(status).json(dto);
  }
}
