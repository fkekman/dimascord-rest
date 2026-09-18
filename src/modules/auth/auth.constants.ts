export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
} as const;

export const CLEAR_REFRESH_COOKIE_OPTIONS = {
  path: '/api/auth',
} as const;

export const REFRESH_TOKEN_COOKIE_KEY = 'refreshToken';

export const IS_PUBLIC_KEY = 'IS_PUBLIC';

export const JWT_SECRET = 'some_secret';
export const JWT_TTL = '300s';
