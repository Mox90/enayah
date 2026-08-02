//generic verification repository

// enayah-backend/src/modules/hr/credentials/repository/credential-verification.repository.ts

import { and, eq, isNull } from 'drizzle-orm'
import type { AnyPgColumn, AnyPgTable } from 'drizzle-orm/pg-core'

import type { DB } from '../../../../db'

export type CredentialVerificationWriteInput = {
  isVerified: boolean
  remarks: string | null
  actorUserId: string
  occurredAt: Date
}

type CredentialVerificationRepositoryConfig<TTable extends AnyPgTable> = {
  table: TTable

  columns: {
    id: AnyPgColumn
    employeeId: AnyPgColumn
    isDeleted: AnyPgColumn
    deletedAt: AnyPgColumn
  }

  /*
   * This keeps the factory generic while allowing Drizzle
   * to validate each configured table's update properties.
   */
  buildUpdateSet: (
    input: CredentialVerificationWriteInput,
  ) => Partial<TTable['$inferInsert']>
}

export function createCredentialVerificationRepository<
  TTable extends AnyPgTable,
>(config: CredentialVerificationRepositoryConfig<TTable>) {
  return {
    updateVerification: async (
      tx: DB,
      employeeId: string,
      credentialId: string,
      input: CredentialVerificationWriteInput,
    ): Promise<TTable['$inferSelect'] | null> => {
      const updateSet = config.buildUpdateSet(input)

      const result = await tx
        .update(config.table)
        .set(updateSet)
        .where(
          and(
            eq(config.columns.id, credentialId),
            eq(config.columns.employeeId, employeeId),
            eq(config.columns.isDeleted, false),
            isNull(config.columns.deletedAt),
          ),
        )
        .returning()

      /*
       * Drizzle cannot fully resolve the return-array type
       * through a generic AnyPgTable boundary.
       *
       * PostgreSQL returning() produces rows, so keep the
       * workaround localized to this generic query result.
       */
      const updatedRows = result as unknown as Array<TTable['$inferSelect']>

      return updatedRows[0] ?? null
    },
  }
}
