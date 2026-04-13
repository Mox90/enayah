import Redis from 'ioredis'
import { RateLimiterRedis } from 'rate-limiter-flexible'

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  //password: process.env.REDIS_PASSWORD,
})

export const loginLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'login_fail',
  points: 5, // 5 attempts
  duration: 60 * 15, // 15 minutes
  blockDuration: 60 * 15, // block for 15 mins
})
