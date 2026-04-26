export interface AuditLogInput {
  action: string
  resource?: string
  resourceId?: string

  userId?: string

  before?: Record<string, any>
  after?: Record<string, any>

  metadata?: Record<string, any>

  ip?: string
  userAgent?: string
}
