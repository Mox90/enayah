export interface AuditResponseDTO {
  id: string
  userId?: string
  action: string
  resource?: string
  resourceId?: string

  before?: any
  after?: any

  metadata?: any
  ip?: string
  userAgent?: string

  createdAt: string
}
