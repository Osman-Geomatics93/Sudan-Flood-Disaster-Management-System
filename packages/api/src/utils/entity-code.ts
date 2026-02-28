import { count as drizzleCount } from 'drizzle-orm';
import type { Database } from '@sudanflood/db';
import { generateEntityCode } from '@sudanflood/shared';

const MAX_RETRIES = 3;

/**
 * Generate a unique entity code with retry logic to handle race conditions.
 * If the initial COUNT(*)+1 approach results in a duplicate, retries with a
 * higher random sequence number.
 */
export async function generateUniqueCode(
  db: Database,
  table: any,
  prefix: string,
  options?: { stateCode?: string },
): Promise<string> {
  const countResult = await db.select({ count: drizzleCount() }).from(table);
  const seq = (countResult[0]?.count ?? 0) + 1;
  return generateEntityCode(prefix, seq, options);
}

/**
 * Wraps a database insert with retry logic for unique code constraint violations.
 * If the insert fails due to a duplicate key on the entity code, it generates
 * a new code with a random offset and retries.
 */
export async function withCodeRetry<T>(
  fn: (code: string) => Promise<T>,
  db: Database,
  table: any,
  prefix: string,
  options?: { stateCode?: string },
): Promise<T> {
  let code = await generateUniqueCode(db, table, prefix, options);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn(code);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('duplicate key') || error.message.includes('unique constraint')) &&
        error.message.includes('_code_') &&
        attempt < MAX_RETRIES
      ) {
        // Generate a new code with a random higher offset
        const countResult = await db.select({ count: drizzleCount() }).from(table);
        const seq = (countResult[0]?.count ?? 0) + 1 + Math.floor(Math.random() * 1000);
        code = generateEntityCode(prefix, seq, options);
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Failed to generate unique code for ${prefix} after ${MAX_RETRIES} retries`);
}
