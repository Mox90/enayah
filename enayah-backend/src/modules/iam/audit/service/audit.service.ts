import { AuditRepository } from '../repository/audit.repository'
import { AuditLogInput } from '../../../../core/types/audit.types'

export const AuditService = {
  log: async (data: AuditLogInput) => {
    return AuditRepository.create(data)
  },

  getAll: async () => {
    return AuditRepository.findAll()
  },
}
