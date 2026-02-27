import bcrypt from 'bcrypt';
import { PASSWORD } from '@sudanflood/shared';

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, PASSWORD.BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  // Support legacy SHA-256 hashes from seed data (64 hex chars, no $ prefix)
  if (hashedPassword.length === 64 && !hashedPassword.startsWith('$')) {
    const { createHash } = await import('crypto');
    const sha256 = createHash('sha256').update(plainPassword).digest('hex');
    return sha256 === hashedPassword;
  }
  return bcrypt.compare(plainPassword, hashedPassword);
}
