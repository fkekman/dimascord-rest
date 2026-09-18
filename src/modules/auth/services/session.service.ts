import { Injectable } from '@nestjs/common';
import { Session, SessionRepository } from '../repositories/session.repository';
import {
  SessionCreateDto,
  SessionCreateResult,
  SessionMetadataDto,
  SessionRefreshDto,
} from '../interfaces/session-service.interface';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async refresh(dto: SessionRefreshDto): Promise<string> {
    const { id, ...data } = dto;
    const refreshToken = crypto.randomUUID();
    await this.sessionRepository.update(id, {
      refreshToken,
      ...data,
    });
    return refreshToken;
  }

  async isValidMetadata(_session: Session, _new: SessionMetadataDto) {
    return true;
  }

  findByRefreshToken(refreshToken: string) {
    return this.sessionRepository.findByRefreshToken(refreshToken);
  }

  async create(dto: SessionCreateDto): Promise<SessionCreateResult> {
    const refreshToken = crypto.randomUUID();
    const newSession = await this.sessionRepository.create({
      refreshToken,
      ...dto,
    });
    return {
      id: newSession.id,
      refreshToken,
    };
  }

  async revokeById(sessionId: string): Promise<void> {
    await this.sessionRepository.deleteById(sessionId);
  }

  async revokeByRefreshToken(refreshToken: string): Promise<void> {
    await this.sessionRepository.deleteByRefreshToken(refreshToken);
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.sessionRepository.deleteByUserId(userId);
  }
}
