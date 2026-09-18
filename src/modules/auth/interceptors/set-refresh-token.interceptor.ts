import { Response } from 'express';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import {
  CLEAR_REFRESH_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_KEY,
} from '../auth.constants';

export class SetRefreshTokenInterceptor implements NestInterceptor {
  intercept(
    ctx: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        const hasRefreshToken =
          data && typeof data === 'object' && 'refreshToken' in data;
        if (!hasRefreshToken) return data;

        const refreshToken = data.refreshToken;
        const response = ctx.switchToHttp().getResponse<Response>();
        if (refreshToken === null) {
          response.clearCookie(
            REFRESH_TOKEN_COOKIE_KEY,
            CLEAR_REFRESH_COOKIE_OPTIONS,
          );
        } else {
          response.cookie(
            REFRESH_TOKEN_COOKIE_KEY,
            refreshToken,
            REFRESH_COOKIE_OPTIONS,
          );
        }
        delete data.refreshToken;
        return data;
      }),
    );
  }
}
