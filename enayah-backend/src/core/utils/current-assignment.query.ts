// current-assignment.query.ts

import { desc, eq, sql } from 'drizzle-orm'
import { contractMovements } from '../../db/schema'
import { DB } from '../../db'

// export const latestContractMovement = (tx: DB) =>
//   tx
//     .select({
//       contractId: contractMovements.contractId,
//       maxSequence: sql<number>`
//         max(${contractMovements.sequenceNumber})
//       `.as('maxSequence'),
//     })
//     .from(contractMovements)
//     .groupBy(contractMovements.contractId)
//     .as('latestContractMovement')

// export const latestContractMovement = (tx: DB, contractId: any) =>
//   tx.query.contractMovements.findFirst({
//     where: eq(contractMovements.contractId, contractId),
//     orderBy: [desc(contractMovements.sequenceNumber)],
//   })

export const latestContractMovement = (tx: DB) =>
  tx
    .selectDistinctOn([contractMovements.contractId], {
      id: contractMovements.id,
      contractId: contractMovements.contractId,
      positionItemId: contractMovements.positionItemId,
      officialDepartmentId: contractMovements.officialDepartmentId,
      officialPositionId: contractMovements.officialPositionId,
      sequenceNumber: contractMovements.sequenceNumber,
      movementType: contractMovements.movementType,
      remarks: contractMovements.remarks,
      startDate: contractMovements.startDate,
      endDate: contractMovements.endDate,
    })
    .from(contractMovements)
    .orderBy(
      contractMovements.contractId,
      desc(contractMovements.sequenceNumber),
    )
    .as('latestMovement')
