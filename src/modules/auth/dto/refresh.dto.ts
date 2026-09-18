import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshResponseDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
