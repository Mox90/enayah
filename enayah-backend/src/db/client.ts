import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from './schema'
import { Pool } from 'pg'
import { env } from '../config/env'

export type Schema = typeof schema

export type DB = NodePgDatabase<Schema>

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db: DB = drizzle(pool, {
  schema,
  logger: env.NODE_ENV !== 'production',
})

// 🔥 NEW FUNCTION
export const setDbContext = async (userId: string, employeeId: string) => {
  await pool.query(`SELECT set_app_context($1, $2)`, [userId, employeeId])
}

export { pool }
