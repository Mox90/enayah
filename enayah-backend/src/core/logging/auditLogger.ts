import { AuditRepository } from '../../modules/iam/audit/repository/audit.repository'
import { AuditLogInput } from '../types/audit.types'

export const auditLogger = {
  log: async (data: AuditLogInput) => {
    try {
      await AuditRepository.create(data)
    } catch (err) {
      console.error('❌ Audit log failed:', err)
    }
  },
}
