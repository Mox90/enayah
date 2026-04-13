type CacheEntry = {
  permissions: string[]
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()

const TTL = 60 * 1000 // 1 minute (configurable)

export const PermissionCache = {
  get: (userId: string): string[] | null => {
    const entry = cache.get(userId)

    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      cache.delete(userId)
      return null
    }

    return entry.permissions
  },

  set: (userId: string, permissions: string[]) => {
    cache.set(userId, {
      permissions,
      expiresAt: Date.now() + TTL,
    })
  },

  invalidate: (userId: string) => {
    cache.delete(userId)
  },

  clearAll: () => {
    cache.clear()
  },
}
