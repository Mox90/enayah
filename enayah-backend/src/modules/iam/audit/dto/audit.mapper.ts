import { AuditResponseDTO } from './audit.response'

export const toAuditResponse = (data: any): AuditResponseDTO => ({
  id: data.id,
  action: data.action,
  createdAt: data.createdAt,

  ...(data.userId && { userId: data.userId }),
  ...(data.resource && { resource: data.resource }),
  ...(data.resourceId && { resourceId: data.resourceId }),

  ...(data.before && { before: data.before }),
  ...(data.after && { after: data.after }),

  ...(data.metadata && { metadata: data.metadata }),
  ...(data.ip && { ip: data.ip }),
  ...(data.userAgent && { userAgent: data.userAgent }),
})
