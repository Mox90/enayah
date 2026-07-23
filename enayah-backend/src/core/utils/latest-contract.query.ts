// enayah-backend/src/core/utils/latest-contract.query.ts

import { and, desc, eq, isNull } from 'drizzle-orm'

import type { DB } from '../../db'
import { contracts } from '../../db/schema'

export function latestContract(tx: DB) {
  return tx
    .selectDistinctOn([contracts.employmentId], {
      id: contracts.id,
      employmentId: contracts.employmentId,
      contractNumber: contracts.contractNumber,
      startDate: contracts.startDate,
      endDate: contracts.endDate,
      contractType: contracts.contractType,
      status: contracts.status,
      signedDate: contracts.signedDate,
      documentPath: contracts.documentPath,
      notes: contracts.notes,
      createdAt: contracts.createdAt,
      version: contracts.version,
    })
    .from(contracts)
    .where(and(eq(contracts.isDeleted, false), isNull(contracts.deletedAt)))
    .orderBy(
      contracts.employmentId,
      desc(contracts.startDate),
      desc(contracts.endDate),
      desc(contracts.createdAt),
    )
    .as('latestContract')
}
