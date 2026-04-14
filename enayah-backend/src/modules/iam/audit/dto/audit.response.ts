export interface AuditResponseDTO {
  id: string
  userId?: string
  action: string
  resource?: string
  resourceId?: string
  metadata?: any
  ip?: string
  userAgent?: string
  createdAt: string
}
