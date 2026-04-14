import { auditLogs, db } from '../../../../db'
import { AuditLogInput } from '../../../../core/types/audit.types'

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
      //...(data.resource && { resource: data.resource }),
      //...(data.resourceId && { resourceId: data.resourceId }),
      ...(resource && { resource }),
      ...(resourceId && { resourceId }),
      ...(data.metadata && { metadata: data.metadata }),
      //...(data.ip && { ip: data.ip }),
      //...(data.userAgent && { userAgent: data.userAgent }),
      ...(ip && { ip }),
      ...(userAgent && { userAgent }),
    })
  },

  findAll: async () => {
    return db.query.auditLogs.findMany({
      orderBy: (auditLogs, { desc }) => [desc(auditLogs.createdAt)],
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
