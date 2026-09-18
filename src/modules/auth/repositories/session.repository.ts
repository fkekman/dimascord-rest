import {
  DefaultEntry,
  InMemoryRepository,
} from '../../../common/in-memory.repository';

export interface Session extends DefaultEntry {
  userId: string;
  refreshToken: string;
  ip: string;
  userAgent: string;
}

export class SessionRepository extends InMemoryRepository<Session> {
  findByRefreshToken(refreshToken: string) {
    return this.findOne({
      refreshToken,
    });
  }

  async deleteById(sessionId: string) {
    await this.delete(sessionId);
  }

  async deleteByUserId(userId: string) {
    const foundSessions = await this.find({ userId });
    await Promise.all(foundSessions.map(({ id }) => this.delete(id)));
  }

  async deleteByRefreshToken(refreshToken: string) {
    const foundSession = await this.findOne({ refreshToken });
    if (!foundSession) return;
    await this.delete(foundSession.id);
  }
}
