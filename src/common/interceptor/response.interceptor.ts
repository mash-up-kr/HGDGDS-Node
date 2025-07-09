import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request } from 'express';
import { CommonResponse } from '../response/common.response';

@Injectable()
export class CommonResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.url === '/.well-known/apple-app-site-association') {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        return new CommonResponse(200, 'OK', data);
      }),
    );
  }
}
