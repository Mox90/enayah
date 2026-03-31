import dotenv from 'dotenv'
dotenv.config()

function required(name: string, value: string | undefined) {
  if (!value) throw new Error(`Missing env: ${name}`)
  return value
}

export const env = {
  PORT: Number(process.env.PORT || 3000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: required('DATABASE_URL', process.env.DATABASE_URL),
  JWT_SECRET: required('JWT_SECRET', process.env.JWT_SECRET),
}
