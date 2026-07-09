import { desc, like, sql } from 'drizzle-orm'
import { DBTransaction } from './import.types'
import { contracts } from '../../db'

//import { contracts } from '../../../db/schema'
//import { DBTransaction } from '../import.types'

export async function generateSequenceNumber(
  tx: DBTransaction,
  hireYear: string,
): Promise<string> {
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${hireYear}))`)

  const [latestContract] = await tx
    .select({ contractNumber: contracts.contractNumber })
    .from(contracts)
    .where(like(contracts.contractNumber, `${hireYear}-%`))
    .orderBy(desc(contracts.contractNumber))
    .limit(1)

  const nextSequence = latestContract?.contractNumber
    ? Number(latestContract.contractNumber.split('-')[1]) + 1
    : 1

  return `${hireYear}-${String(nextSequence).padStart(6, '0')}`
}
