import { auditLogs, db } from '../../../../db'
import { AuditLogInput } from '../../../../core/types/audit.types'

export const AuditRepository = {
  create: async (data: AuditLogInput) => {
    return db.insert(auditLogs).values({
      ...(data.userId && { userId: data.userId }),
      action: data.action,
      ...(data.resource && { resource: data.resource }),
      ...(data.resourceId && { resourceId: data.resourceId }),
      ...(data.metadata && { metadata: data.metadata }),
      ...(data.ip && { ip: data.ip }),
      ...(data.userAgent && { userAgent: data.userAgent }),
    })
  },

  findAll: async () => {
    return db.query.auditLogs.findMany({
      orderBy: (auditLogs, { desc }) => [desc(auditLogs.createdAt)],
    })
  },
}
