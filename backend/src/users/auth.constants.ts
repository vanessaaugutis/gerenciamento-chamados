const isProduction = process.env.NODE_ENV === 'production';
const secret = process.env.JWT_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (isProduction && (!secret || !refreshSecret)) {
  throw new Error('JWT_SECRET e JWT_REFRESH_SECRET são obrigatórios em produção.');
}

export const jwtConstants = {
  secret: secret || 'development-only-secret',
  refreshSecret: refreshSecret || 'development-only-refresh-secret',
  accessTokenExpiresIn: '15m',
  refreshTokenExpiresIn: '7d',
  refreshTokenMaxAge: 7 * 24 * 60 * 60 * 1000,
} as const;
