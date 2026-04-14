export interface AuditLogInput {
  userId?: string
  action: string
  resource?: string
  resourceId?: string
  metadata?: Record<string, any>
  ip?: string
  userAgent?: string
}
