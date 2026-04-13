import Redis from 'ioredis'
import { RateLimiterRedis } from 'rate-limiter-flexible'

//const redis = new Redis({
//  host: process.env.REDIS_HOST,
//  port: parseInt(process.env.REDIS_PORT || '6379'),
//password: process.env.REDIS_PASSWORD,
//})
const redisPort = Number(process.env.REDIS_PORT ?? '6379')
if (!Number.isInteger(redisPort) || redisPort < 1 || redisPort > 65535) {
  throw new Error('Invalid REDIS_PORT: expected an integer between 1 and 65535')
}

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: redisPort,
  password: process.env.REDIS_PASSWORD,
})

redis.on('error', (err) => {
  console.error('Redis error', err)
})

export const loginLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'login_fail',
  points: 5, // 5 attempts
  duration: 60 * 15, // 15 minutes
  blockDuration: 60 * 15, // block for 15 mins
})
