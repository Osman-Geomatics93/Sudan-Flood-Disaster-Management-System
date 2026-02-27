import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../src/schema/index.js';
import { seedStates } from './001_sudan_states.js';
import { seedLocalities } from './002_localities.js';
import { seedOrganizations } from './003_organizations.js';
import { seedUsers } from './004_demo_users.js';

async function seed() {
  const url = process.env['DATABASE_URL'];
  if (!url) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql, { schema });

  try {
    console.log('Starting seed process...\n');

    console.log('Step 1/4: Seeding states...');
    const stateMap = await seedStates(db);
    console.log(`  -> ${Object.keys(stateMap).length} states seeded\n`);

    console.log('Step 2/4: Seeding localities...');
    const localityCount = await seedLocalities(db, stateMap);
    console.log(`  -> ${localityCount} localities seeded\n`);

    console.log('Step 3/4: Seeding organizations...');
    const orgMap = await seedOrganizations(db, stateMap);
    console.log(`  -> ${Object.keys(orgMap).length} organizations seeded\n`);

    console.log('Step 4/4: Seeding demo users...');
    const userCount = await seedUsers(db, orgMap, stateMap);
    console.log(`  -> ${userCount} users seeded\n`);

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seed();
