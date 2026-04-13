// src/db/migrate.ts

import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { env } from '../config/env'

const pool = new Pool({
  connectionString: env.DATABASE_URL,
})

const db = drizzle(pool)

async function runMigration() {
  try {
    await migrate(db, { migrationsFolder: 'drizzle' })
    console.log('✅ Migrations applied')
  } catch (err) {
    console.error('❌ Migration failed:', err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error('❌ Migration failed:', err)
    await pool.end()
    process.exit(1)
  })
