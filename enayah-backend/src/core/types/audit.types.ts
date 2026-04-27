export type AuditLogInput = {
  action: string

  userId?: string
  resource?: string
  resourceId?: string

  before?: Record<string, any>
  after?: Record<string, any>

  metadata?: Record<string, any>

  ip?: string
  userAgent?: string

  // 🔥 NEW (COMPLIANCE)
  success?: boolean
  requestId?: string
  module?: string

  // 🔥 GOVERNANCE
  reviewed?: boolean
  reviewedBy?: string
  reviewedAt?: Date
}
