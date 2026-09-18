import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import {
  JwtPayload,
  NewUserCredentials,
  TokensResult,
  UserCredentials,
} from '../interfaces/auth-service.interface';
import { SessionService } from './session.service';
import { UserService } from '../../user/services/user.service';
import { SessionMetadataDto } from '../interfaces/session-service.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
  ) {}
  async login(
    creds: UserCredentials,
    metadata: SessionMetadataDto,
  ): Promise<TokensResult> {
    const { email, password } = creds;

    const foundUser = await this.userService.findUserByEmail(email);

    if (!foundUser) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      foundUser.passwordHash,
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const canLogin = await this.userService.canLogin(foundUser.id);
    if (!canLogin) {
      throw new UnauthorizedException('Cant login');
    }

    return this.createSessionAndTokens(foundUser.id, metadata);
  }

  async register(
    newUserCreds: NewUserCredentials,
    metadata: SessionMetadataDto,
  ): Promise<TokensResult> {
    const passwordHash = await bcrypt.hash(newUserCreds.password, 10);

    const newUser = await this.userService.create({
      email: newUserCreds.email,
      passwordHash,
      username: newUserCreds.username,
    });

    return this.createSessionAndTokens(newUser.id, metadata);
  }

  async refresh(
    refreshToken: string,
    newMetadata: SessionMetadataDto,
  ): Promise<TokensResult> {
    const foundSession =
      await this.sessionService.findByRefreshToken(refreshToken);
    if (!foundSession) {
      throw new UnauthorizedException('Session not found');
    }
    const { userId, id: sessionId } = foundSession;

    const canLogin = await this.userService.canLogin(userId);
    if (!canLogin) {
      await this.sessionService.revokeById(sessionId);
      throw new UnauthorizedException('Cant login');
    }

    const isValidMetadata = await this.sessionService.isValidMetadata(
      foundSession,
      newMetadata,
    );
    if (!isValidMetadata) {
      await this.sessionService.revokeById(sessionId);
      throw new UnauthorizedException('Invalid metadata');
    }

    const newRefreshToken = await this.sessionService.refresh({
      id: sessionId,
      ...newMetadata,
    });

    const newAccessToken = await this.generateNewAccessToken({
      sessionId,
      sub: userId,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    await this.sessionService.revokeByRefreshToken(refreshToken);
    return { refreshToken: null };
  }

  private async createSessionAndTokens(
    userId: string,
    metadata: SessionMetadataDto,
  ) {
    const { id: sessionId, refreshToken } = await this.sessionService.create({
      userId,
      ...metadata,
    });

    const accessToken = await this.generateNewAccessToken({
      sub: userId,
      sessionId,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private generateNewAccessToken(payload: JwtPayload) {
    return this.jwtService.signAsync(payload);
  }
}
