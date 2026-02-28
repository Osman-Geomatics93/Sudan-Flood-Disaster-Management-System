import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import type { UserRole } from '@sudanflood/shared';

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  orgId: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
}

function getSecret(): Uint8Array {
  const secret = process.env['NEXTAUTH_SECRET'];
  if (!secret) throw new Error('NEXTAUTH_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(
  payload: Pick<TokenPayload, 'userId' | 'email' | 'role' | 'orgId'>,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .setIssuer('sudanflood')
    .setAudience('sudanflood')
    .sign(getSecret());
}

export async function signRefreshToken(payload: Pick<TokenPayload, 'userId'>): Promise<string> {
  return new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .setIssuer('sudanflood')
    .setAudience('sudanflood-refresh')
    .sign(getSecret());
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getSecret(), {
    issuer: 'sudanflood',
    audience: 'sudanflood',
  });
  return payload as TokenPayload;
}

export async function verifyRefreshToken(token: string): Promise<Pick<TokenPayload, 'userId'>> {
  const { payload } = await jwtVerify(token, getSecret(), {
    issuer: 'sudanflood',
    audience: 'sudanflood-refresh',
  });
  return { userId: payload['userId'] as string };
}

export async function generateTokenPair(
  payload: Pick<TokenPayload, 'userId' | 'email' | 'role' | 'orgId'>,
): Promise<TokenPair> {
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(payload),
    signRefreshToken({ userId: payload.userId }),
  ]);

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
  };
}
