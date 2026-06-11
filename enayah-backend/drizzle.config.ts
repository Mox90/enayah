import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema',
  out: './drizzle/schema',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
