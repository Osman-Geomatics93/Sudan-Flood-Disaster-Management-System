import { eq } from 'drizzle-orm';
import type { Database } from './types.js';
import { localities } from '../src/schema/locations.js';
import { SUDAN_LOCALITIES } from '@sudanflood/shared';

export async function seedLocalities(
  db: Database,
  stateMap: Record<string, string>,
): Promise<number> {
  let count = 0;

  for (const locality of SUDAN_LOCALITIES) {
    const stateId = stateMap[locality.state_code];
    if (!stateId) {
      console.warn(`  Warning: State ${locality.state_code} not found, skipping ${locality.code}`);
      continue;
    }

    // Check if already exists
    const existing = await db
      .select({ id: localities.id })
      .from(localities)
      .where(eq(localities.code, locality.code))
      .limit(1);

    if (existing.length > 0) {
      count++;
      continue;
    }

    await db.insert(localities).values({
      stateId,
      code: locality.code,
      name_en: locality.name_en,
      name_ar: locality.name_ar,
    });

    count++;
  }

  return count;
}
