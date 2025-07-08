import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';
import { BaseException } from '../exception/base.exception';
import { ErrorResponseDto } from '../dto/response/error-response.dto';
import { getAppMode } from '../utility';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    console.log(exception);
    if (exception instanceof BaseException) {
      const status = exception.getStatus();
      const dto = exception.getResponse() as ErrorResponseDto;
      res.status(status).json(dto);
      return;
    }
    if (exception instanceof UnauthorizedException) {
      const status = exception.getStatus();
      const dto = exception.getResponse() as ErrorResponseDto;
      res.status(status).json(dto);
      return;
    }
    const webhookUrl = process.env.SLACK_WEBHOOK_URL ?? '';

    const req = ctx.getRequest<Request>();

    const method = req.method;
    const url = req.originalUrl;
    const query = JSON.stringify(req.query);
    const body = JSON.stringify(req.body);

    if (getAppMode() == 'prod') {
      let message = 'Unexpected error';
      let stack = '';
      if (exception instanceof Error) {
        message = exception.message ?? message;
        stack = exception.stack ?? '';
      }
      const slackMessage = [
        '🚨 *에러 알림* 🚨',
        `*-- Request --*`,
        `*Method:* ${method}`,
        `*URL:* ${url}`,
        `*Query:* \`${query}\``,
        `*Body:* \`${body}\``,
        `*-- Error --*`,
        `\`\`\`${message}\`\`\``,
        `\`\`\`${stack}\`\`\``,
      ].join('\n');

      await axios.post(webhookUrl, { text: slackMessage }).catch(console.error);
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
