import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatInTimeZone } from 'date-fns-tz';

type FormatInTimeZoneFn = (
  date: Date,
  timeZone: string,
  format: string,
  options?: any,
) => string;

@Injectable()
export class TimezoneInterceptor implements NestInterceptor<unknown, unknown> {
  private readonly TIMEZONE = 'Asia/Seoul';
  private readonly FORMAT = "yyyy-MM-dd'T'HH:mm:ssXXX";
  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> {
    return next.handle().pipe(map((data) => this.transformDates(data)));
  }

  private transformDates(obj: unknown): unknown {
    if (obj instanceof Date) {
      return (formatInTimeZone as FormatInTimeZoneFn)(
        obj,
        this.TIMEZONE,
        this.FORMAT,
      );
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformDates(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.transformDates(value);
      }
      return result;
    }

    return obj;
  }
}
