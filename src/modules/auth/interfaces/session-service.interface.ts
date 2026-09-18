import { Session } from '../repositories/session.repository';

export interface SessionMetadataDto extends Pick<Session, 'ip' | 'userAgent'> {}

export interface SessionRefreshDto extends Omit<
  Session,
  'createdAt' | 'updatedAt' | 'userId' | 'refreshToken'
> {}

export interface SessionCreateDto extends Omit<
  Session,
  'id' | 'createdAt' | 'updatedAt' | 'refreshToken'
> {}

export interface SessionCreateResult extends Pick<
  Session,
  'id' | 'refreshToken'
> {}
