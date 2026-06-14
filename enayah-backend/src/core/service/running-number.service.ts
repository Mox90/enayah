// src/core/services/running-number.service.ts

import { DB } from '../../db'
import { RunningNumberRepository } from '../repository/running-number.repository'

type RunningNumberType =
  | 'EMPLOYEE'
  | 'CONTRACT'
  | 'PCN'
  | 'TRANSFER'
  | 'PROMOTION'

const CONFIG: Record<
  RunningNumberType,
  {
    prefix: string
    includeYearAfterPrefix: boolean
  }
> = {
  EMPLOYEE: {
    prefix: 'EMP',
    includeYearAfterPrefix: true,
  },

  CONTRACT: {
    prefix: '',
    includeYearAfterPrefix: true,
  },

  PCN: {
    prefix: 'PCN',
    includeYearAfterPrefix: true,
  },

  TRANSFER: {
    prefix: 'TRF',
    includeYearAfterPrefix: true,
  },

  PROMOTION: {
    prefix: 'PRM',
    includeYearAfterPrefix: true,
  },
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

    if (config.includeYearAfterPrefix) {
      return `${config.prefix}${year}-${sequence}`
    }

    return `${config.prefix}${sequence}`
  },
}
