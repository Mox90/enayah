import { auditLogs, db } from '../../../../db'
import { AuditLogInput } from '../../../../core/types/audit.types'
import { and, eq, gte, lte } from 'drizzle-orm'

type FindAllAuditParams = {
  limit?: number
  cursor?: string // or Date or ID depending on schema
}

export const AuditRepository = {
  create: async (data: AuditLogInput) => {
    const resource = data.resource?.slice(0, 100)
    const resourceId = data.resourceId?.slice(0, 100)
    const ip = data.ip?.slice(0, 45)
    const userAgent = data.userAgent?.slice(0, 255)

    return db.insert(auditLogs).values({
      ...(data.userId && { userId: data.userId }),
      action: data.action,

      ...(resource && { resource }),
      ...(resourceId && { resourceId }),

      //...(data.before && { before: data.before }),
      //...(data.after && { after: data.after }),
      ...(data.before !== undefined ? { before: data.before } : {}),
      ...(data.after !== undefined ? { after: data.after } : {}),

      ...(data.metadata && { metadata: data.metadata }),

      ...(ip && { ip }),
      ...(userAgent && { userAgent }),
    })
  },

  findAll: async () => {
    return db.query.auditLogs.findMany({
      orderBy: (auditLogs, { desc }) => [desc(auditLogs.createdAt)],
    })
  },

  getLogs: async (filters: {
    resource?: string

    action?: string

    userId?: string

    from?: Date

    to?: Date
  }) => {
    return db.query.auditLogs.findMany({
      where: and(
        filters.resource ? eq(auditLogs.resource, filters.resource) : undefined,
        filters.action ? eq(auditLogs.action, filters.action) : undefined,
        filters.userId ? eq(auditLogs.userId, filters.userId) : undefined,
        filters.from ? gte(auditLogs.createdAt, filters.from) : undefined,
        filters.to ? lte(auditLogs.createdAt, filters.to) : undefined,
      ),

      orderBy: (a, { desc }) => [desc(a.createdAt)],
    })
  },
  /*findAll: async ({ limit = 50, cursor }: FindAllAuditParams = {}) => {
    const MAX_LIMIT = 100

    const safeLimit = Math.min(limit, MAX_LIMIT)

    return db.query.auditLogs.findMany({
      ...(cursor && {
        where: (auditLogs, { lt }) => lt(auditLogs.createdAt, new Date(cursor)),
      }),

      orderBy: (auditLogs, { desc }) => [desc(auditLogs.createdAt)],

      limit: safeLimit,
    })
  },*/
}
