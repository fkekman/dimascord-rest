import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class LoginRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto {
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
