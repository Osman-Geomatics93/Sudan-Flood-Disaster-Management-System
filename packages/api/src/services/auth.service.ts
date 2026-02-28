import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { Database } from '@sudanflood/db';
import { users } from '@sudanflood/db/schema';
import type { RegisterInput, UserRole } from '@sudanflood/shared';
import { hashPassword, verifyPassword } from './password.service.js';
import { generateTokenPair, verifyRefreshToken, type TokenPair } from './jwt.service.js';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  orgId: string | null;
  firstName_ar: string | null;
  firstName_en: string | null;
  lastName_ar: string | null;
  lastName_en: string | null;
  preferredLocale: string;
  phone: string | null;
}

export interface LoginResult {
  user: AuthUser;
  tokens: TokenPair;
}

export async function loginUser(
  db: Database,
  email: string,
  password: string,
): Promise<LoginResult> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
  }

  if (!user.isActive) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Account is deactivated' });
  }

  if (user.deletedAt) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
  }

  // Update last login
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  const tokens = await generateTokenPair({
    userId: user.id,
    email: user.email!,
    role: user.role,
    orgId: user.orgId,
  });

  return {
    user: {
      id: user.id,
      email: user.email!,
      role: user.role,
      orgId: user.orgId,
      firstName_ar: user.firstName_ar,
      firstName_en: user.firstName_en,
      lastName_ar: user.lastName_ar,
      lastName_en: user.lastName_en,
      preferredLocale: user.preferredLocale,
      phone: user.phone,
    },
    tokens,
  };
}

export async function registerUser(db: Database, input: RegisterInput): Promise<LoginResult> {
  // Check if email already exists
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existing) {
    throw new TRPCError({ code: 'CONFLICT', message: 'Email already registered' });
  }

  const passwordHash = await hashPassword(input.password);

  const [newUser] = await db
    .insert(users)
    .values({
      email: input.email,
      passwordHash,
      phone: input.phone ?? null,
      role: input.role,
      firstName_ar: input.firstName_ar,
      lastName_ar: input.lastName_ar,
      firstName_en: input.firstName_en ?? null,
      lastName_en: input.lastName_en ?? null,
      orgId: input.orgId ?? null,
      preferredLocale: input.preferredLocale,
    })
    .returning();

  if (!newUser) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create user' });
  }

  const tokens = await generateTokenPair({
    userId: newUser.id,
    email: newUser.email!,
    role: newUser.role,
    orgId: newUser.orgId,
  });

  return {
    user: {
      id: newUser.id,
      email: newUser.email!,
      role: newUser.role,
      orgId: newUser.orgId,
      firstName_ar: newUser.firstName_ar,
      firstName_en: newUser.firstName_en,
      lastName_ar: newUser.lastName_ar,
      lastName_en: newUser.lastName_en,
      preferredLocale: newUser.preferredLocale,
      phone: newUser.phone,
    },
    tokens,
  };
}

export async function refreshUserTokens(db: Database, refreshToken: string): Promise<TokenPair> {
  let decoded: { userId: string };
  try {
    decoded = await verifyRefreshToken(refreshToken);
  } catch {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid refresh token' });
  }

  const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);

  if (!user || !user.isActive || user.deletedAt) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found or inactive' });
  }

  return generateTokenPair({
    userId: user.id,
    email: user.email!,
    role: user.role,
    orgId: user.orgId,
  });
}

export async function getUserById(db: Database, userId: string): Promise<AuthUser | null> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user || !user.isActive || user.deletedAt) return null;

  return {
    id: user.id,
    email: user.email!,
    role: user.role,
    orgId: user.orgId,
    firstName_ar: user.firstName_ar,
    firstName_en: user.firstName_en,
    lastName_ar: user.lastName_ar,
    lastName_en: user.lastName_en,
    preferredLocale: user.preferredLocale,
    phone: user.phone,
  };
}

export async function changeUserPassword(
  db: Database,
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Current password is incorrect' });
  }

  const newHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, userId));
}
