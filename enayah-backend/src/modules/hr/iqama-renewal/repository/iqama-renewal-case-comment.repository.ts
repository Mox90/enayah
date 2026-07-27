// enayah-backend/src/modules/hr/iqama-renewal-process/repository/iqama-renewal-case-comment.repository.ts

import { and, asc, eq, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

import {
  employees,
  iqamaRenewalCaseComments,
  users,
  type DB,
} from '../../../../db'
import { CreateIqamaRenewalCaseCommentData } from '../types/iqama-renewal-case-comment.types'

//import type { CreateIqamaRenewalCaseCommentData } from '../types/iqama-renewal-case-comment.types'

const authorEmployee = alias(employees, 'iqama_comment_author_employee')

export const IqamaRenewalCaseCommentRepository = {
  create: async (tx: DB, data: CreateIqamaRenewalCaseCommentData) => {
    const [created] = await tx
      .insert(iqamaRenewalCaseComments)
      .values({
        caseId: data.caseId,
        authorUserId: data.authorUserId,
        body: data.body,
        statusAtTime: data.statusAtTime,
        parentCommentId: data.parentCommentId ?? null,
        threadRootId: data.threadRootId ?? null,
      })
      .returning()

    return created ?? null
  },

  findByIdInCase: async (tx: DB, caseId: string, commentId: string) => {
    const [comment] = await tx
      .select()
      .from(iqamaRenewalCaseComments)
      .where(
        and(
          eq(iqamaRenewalCaseComments.id, commentId),
          eq(iqamaRenewalCaseComments.caseId, caseId),
        ),
      )
      .limit(1)

    return comment ?? null
  },

  findParticipantUserIds: async (tx: DB, caseId: string) => {
    return tx
      .selectDistinct({
        userId: iqamaRenewalCaseComments.authorUserId,
      })
      .from(iqamaRenewalCaseComments)
      .where(eq(iqamaRenewalCaseComments.caseId, caseId))
  },

  listByCaseId: async (tx: DB, caseId: string) => {
    return tx
      .select({
        id: iqamaRenewalCaseComments.id,
        caseId: iqamaRenewalCaseComments.caseId,
        authorUserId: iqamaRenewalCaseComments.authorUserId,

        parentCommentId: iqamaRenewalCaseComments.parentCommentId,

        threadRootId: iqamaRenewalCaseComments.threadRootId,

        body: iqamaRenewalCaseComments.body,
        statusAtTime: iqamaRenewalCaseComments.statusAtTime,
        createdAt: iqamaRenewalCaseComments.createdAt,

        authorUsername: users.username,
        authorEmail: users.email,

        authorNameEn: sql<string | null>`
          coalesce(
            nullif(
              concat_ws(
                ' ',
                nullif(trim(${authorEmployee.firstNameEn}), ''),
                nullif(trim(${authorEmployee.secondNameEn}), ''),
                nullif(trim(${authorEmployee.thirdNameEn}), ''),
                nullif(trim(${authorEmployee.familyNameEn}), '')
              ),
              ''
            ),
            nullif(trim(${users.username}), ''),
            nullif(trim(${users.email}), '')
          )
        `.as('author_name_en'),

        authorNameAr: sql<string | null>`
          coalesce(
            nullif(
              concat_ws(
                ' ',
                nullif(trim(${authorEmployee.firstNameAr}), ''),
                nullif(trim(${authorEmployee.secondNameAr}), ''),
                nullif(trim(${authorEmployee.thirdNameAr}), ''),
                nullif(trim(${authorEmployee.familyNameAr}), '')
              ),
              ''
            ),
            nullif(trim(${users.username}), ''),
            nullif(trim(${users.email}), '')
          )
        `.as('author_name_ar'),
      })
      .from(iqamaRenewalCaseComments)
      .innerJoin(users, eq(users.id, iqamaRenewalCaseComments.authorUserId))
      .leftJoin(authorEmployee, eq(authorEmployee.id, users.employeeId))
      .where(eq(iqamaRenewalCaseComments.caseId, caseId))
      .orderBy(
        asc(iqamaRenewalCaseComments.createdAt),
        asc(iqamaRenewalCaseComments.id),
      )
  },
}
