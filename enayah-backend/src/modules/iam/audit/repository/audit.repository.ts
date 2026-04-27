import { auditLogs, db } from '../../../../db'
import { AuditLogInput } from '../../../../core/types/audit.types'
import { and, eq, gte, lte } from 'drizzle-orm'
import { generateAuditHash } from '../../../../core/utils/audit.hash'

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

    const hash = generateAuditHash({
      action: data.action,
      userId: data.userId,
      resource: data.resource,
      resourceId: data.resourceId,
      before: data.before,
      after: data.after,
      metadata: data.metadata,
    })

    return db.insert(auditLogs).values({
      ...(data.userId && { userId: data.userId }),
      action: data.action,

      ...(resource && { resource }),
      ...(resourceId && { resourceId }),

      ...(data.before !== undefined ? { before: data.before } : {}),
      ...(data.after !== undefined ? { after: data.after } : {}),

      ...(data.metadata && { metadata: data.metadata }),

      ...(ip && { ip }),
      ...(userAgent && { userAgent }),

      ...(data.success !== undefined && { success: data.success }),
      ...(data.requestId && { requestId: data.requestId }),
      ...(data.module && { module: data.module }),

      // 🔒 integrity
      hash,
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
    limit?: number
    cursor?: Date
  }) => {
    const MAX_LIMIT = 100
    const safeLimit = Math.min(filters.limit ?? 50, MAX_LIMIT)
    return db.query.auditLogs.findMany({
      where: and(
        filters.resource ? eq(auditLogs.resource, filters.resource) : undefined,
        filters.action ? eq(auditLogs.action, filters.action) : undefined,
        filters.userId ? eq(auditLogs.userId, filters.userId) : undefined,
        filters.from ? gte(auditLogs.createdAt, filters.from) : undefined,
        filters.to ? lte(auditLogs.createdAt, filters.to) : undefined,
        filters.cursor ? lte(auditLogs.createdAt, filters.cursor) : undefined,
      ),
      orderBy: (a, { desc }) => [desc(a.createdAt)],
      limit: safeLimit,
    })
  },

  markReviewed: async (id: string, reviewerId: string) => {
    return db
      .update(auditLogs)
      .set({
        reviewed: true,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      })
      .where(eq(auditLogs.id, id))
  },
}
