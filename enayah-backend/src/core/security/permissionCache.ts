import { redis } from './redisClient'

type CacheEntry = {
  permissions: string[]
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry>()

const TTL = Number(process.env.PERMISSION_CACHE_TTL ?? 60000) //60 * 1000 // 1 minute (configurable)

const REDIS_TTL_SECONDS = Math.floor(TTL / 1000)

const getRedisKey = (userId: string) => `perm:${userId}`

export const PermissionCache = {
  get: async (userId: string): Promise<string[] | null> => {
    const entry = memoryCache.get(userId)

    if (entry) {
      if (Date.now() < entry.expiresAt) {
        return entry.permissions
      }
      memoryCache.delete(userId)
    }

    // 🔥 Check Redis (SHARED CACHE)
    if (redis) {
      const cached = await redis.get(getRedisKey(userId))
      if (cached) {
        const permissions = JSON.parse(cached)
        memoryCache.set(userId, {
          permissions,
          expiresAt: Date.now() + TTL,
        })

        return permissions
      }
    }

    return null
  },

  set: async (userId: string, permissions: string[]) => {
    memoryCache.set(userId, {
      permissions,
      expiresAt: Date.now() + TTL,
    })

    if (redis) {
      await redis.set(
        getRedisKey(userId),
        JSON.stringify(permissions),
        'EX',
        REDIS_TTL_SECONDS,
      )
    }
  },

  invalidate: async (userId: string) => {
    memoryCache.delete(userId)

    if (redis) {
      await redis.del(getRedisKey(userId))
    }
  },

  clearAll: async () => {
    memoryCache.clear()

    if (redis) {
      const keys = await redis.keys('perm:*')
      if (keys.length) {
        await redis.del(keys)
      }
    }
  },
}
