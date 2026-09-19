import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { LoginRequestDto, LoginResponseDto } from '../dto/login.dto';
import { RegisterRequestDto, RegisterResponseDto } from '../dto/register.dto';
import { RefreshResponseDto } from '../dto/refresh.dto';
import { AuthService } from '../services/auth.service';
import { Public } from '../decorators/public.decorator';
import type { SessionMetadataDto } from '../interfaces/session-service.interface';
import { Metadata } from '../decorators/metadata.decorator';
import { RefreshToken } from '../decorators/refresh-token.decorator';
import { SetRefreshTokenInterceptor } from '../interceptors/set-refresh-token.interceptor';
import { LogoutResponseDto } from '../dto/logout.dto';

@Controller('auth')
@UseInterceptors(SetRefreshTokenInterceptor)
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: LoginRequestDto,
    @Metadata() metadata: SessionMetadataDto,
  ): Promise<LoginResponseDto> {
    return this.authService.login(dto, metadata);
  }

  @Post('register')
  async register(
    @Body() dto: RegisterRequestDto,
    @Metadata() metadata: SessionMetadataDto,
  ): Promise<RegisterResponseDto> {
    return this.authService.register(dto, metadata);
  }

  @Post('refresh')
  async refresh(
    @Metadata() metadata: SessionMetadataDto,
    @RefreshToken() refreshToken: string,
  ): Promise<RefreshResponseDto> {
    return this.authService.refresh(refreshToken, metadata);
  }

  @Post('logout')
  async logout(
    @RefreshToken() refreshToken: string,
  ): Promise<LogoutResponseDto> {
    return this.authService.logout(refreshToken);
  }
}
