// enayah-backend/src/modules/hr/credentials/repository/credential-verifier.repository.ts

import { eq, inArray, sql } from 'drizzle-orm'

import { employees, users, type DB } from '../../../../db'
import { CredentialVerificationActorSummary } from '../dto/credential-verification.types'

export const CredentialVerifierRepository = {
  findByUserIds: async (
    tx: DB,
    userIds: string[],
  ): Promise<CredentialVerificationActorSummary[]> => {
    const uniqueUserIds = [...new Set(userIds)]

    if (uniqueUserIds.length === 0) {
      return []
    }

    return tx
      .select({
        id: users.id,

        displayName: sql<string>`
          COALESCE(
            NULLIF(
              BTRIM(
                CONCAT_WS(
                  ' ',
                  NULLIF(
                    BTRIM(${employees.firstNameEn}),
                    ''
                  ),
                  NULLIF(
                    BTRIM(${employees.secondNameEn}),
                    ''
                  ),
                  NULLIF(
                    BTRIM(${employees.thirdNameEn}),
                    ''
                  ),
                  NULLIF(
                    BTRIM(${employees.familyNameEn}),
                    ''
                  )
                )
              ),
              ''
            ),
            NULLIF(
              BTRIM(${users.username}),
              ''
            ),
            'Unknown user'
          )
        `,
      })
      .from(users)
      .leftJoin(employees, eq(employees.id, users.employeeId))
      .where(inArray(users.id, uniqueUserIds))
  },
}
