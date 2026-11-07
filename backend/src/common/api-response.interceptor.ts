import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse();
    if (response?.statusCode === 204) {
      return next.handle();
    }

    return next.handle().pipe(
      map((body) => {
        if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data')) {
          return body;
        }
        return { data: body };
      }),
    );
  }
}
