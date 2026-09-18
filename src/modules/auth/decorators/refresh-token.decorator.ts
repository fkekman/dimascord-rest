import { Request } from 'express';
import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { REFRESH_TOKEN_COOKIE_KEY } from '../auth.constants';

export const RefreshToken = createParamDecorator(
  (ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE_KEY];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    return refreshToken;
  },
);
