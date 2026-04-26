import { AuditRepository } from '../../modules/iam/audit/repository/audit.repository'
import { AuditService } from '../../modules/iam/audit/service/audit.service'
import { AuditLogInput } from '../types/audit.types'

export const auditLogger = {
  log: async (data: AuditLogInput) => {
    try {
      await AuditService.log(data) //AuditRepository.create(data)
    } catch (err) {
      console.error('❌ Audit log failed:', err)
    }
  },
}
