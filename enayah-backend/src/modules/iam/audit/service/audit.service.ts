import { AuditRepository } from '../repository/audit.repository'
import { AuditLogInput } from '../../../../core/types/audit.types'
import { isDeepStrictEqual } from 'node:util'

function computeDiff(before: any, after: any) {
  if (!before || !after) return { before, after }

  const changes: Record<string, { before: any; after: any }> = {}

  const keys = new Set([...Object.keys(before), ...Object.keys(after)])

  for (const key of keys) {
    //if (before[key] !== after[key]) {
    if (!isDeepStrictEqual(before[key], after[key])) {
      changes[key] = {
        before: before[key],
        after: after[key],
      }
    }
  }

  return changes
}

export const AuditService = {
  log: async (data: AuditLogInput) => {
    let before = data.before
    let after = data.after

    if (before && after) {
      const diff = computeDiff(before, after)

      before = Object.fromEntries(
        Object.entries(diff).map(([k, v]) => [k, v.before]),
      )

      after = Object.fromEntries(
        Object.entries(diff).map(([k, v]) => [k, v.after]),
      )
    }

    const payload: AuditLogInput = {
      ...data,
      ...(before !== undefined ? { before } : {}),
      ...(after !== undefined ? { after } : {}),
    }

    return AuditRepository.create(payload)
  },

  getAll: async () => {
    return AuditRepository.findAll()
  },
}
