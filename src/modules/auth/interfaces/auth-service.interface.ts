export interface TokensResult {
  accessToken: string;
  refreshToken: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface NewUserCredentials extends UserCredentials {
  username: string;
}

export interface JwtPayload {
  sub: string;
  sessionId: string;
}
