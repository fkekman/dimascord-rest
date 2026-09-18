import { Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SessionMetadataDto } from '../interfaces/session-service.interface';

const getIp = (request: Request) => {
  const xForwardedFor = request.headers['x-forwarded-for'];
  if (xForwardedFor) {
    const ips = Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor.split(',')[0];
    return ips.trim();
  }
  return request.ip || request.socket?.remoteAddress || '';
};

const getUserAgent = (request: Request) => {
  return request.headers['user-agent'] || '';
};

export const Metadata = createParamDecorator(
  (ctx: ExecutionContext): SessionMetadataDto => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const ip = getIp(request);
    const userAgent = getUserAgent(request);
    return {
      ip,
      userAgent,
    };
  },
);
