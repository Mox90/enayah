import { DB } from '../../db'
import { RunningNumberRepository } from '../repository/running-number.repository'

type RunningNumberType =
  | 'EMPLOYEE'
  | 'CONTRACT'
  | 'PCN'
  | 'TRANSFER'
  | 'PROMOTION'

const CONFIG: Record<RunningNumberType, { prefix: string }> = {
  EMPLOYEE: { prefix: 'EMP' },
  CONTRACT: { prefix: '' },
  PCN: { prefix: 'PCN' },
  TRANSFER: { prefix: 'TRF' },
  PROMOTION: { prefix: 'PRM' },
}

export const RunningNumberService = {
  generate: async (tx: DB, type: RunningNumberType, date = new Date()) => {
    const year = date.getFullYear()
    const code = `${type}_${year}`

    const next = await RunningNumberRepository.next(tx, code)

    const sequence = String(next).padStart(6, '0')
    const config = CONFIG[type]

    if (type === 'CONTRACT') {
      return `${year}-${sequence}`
    }

    return `${config.prefix}${year}-${sequence}`
  },
}
