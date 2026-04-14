import Redis from 'ioredis'

const redisPort = Number(process.env.REDIS_PORT ?? '6379')

export const redis =
  process.env.USE_REDIS === 'true'
    ? new Redis({
        host: process.env.REDIS_HOST,
        port: redisPort,
        password: process.env.REDIS_PASSWORD,
      })
    : null

if (redis) {
  redis.on('connect', () => {
    console.log('✅ Redis connected')
  })

  redis.on('error', (err) => {
    console.error('❌ Redis error:', err)
  })
}
