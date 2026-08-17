// enayah-backend/src/modules/hr/iqama-renewal-process/repository/iqama-renewal-case-comment.repository.ts

import { and, asc, eq, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

import {
  employees,
  files,
  iqamaRenewalCaseComments,
  users,
  type DB,
} from '../../../../db'

import type { CreateIqamaRenewalCaseCommentData } from '../types/iqama-renewal-case-comment.types'

const authorEmployee = alias(employees, 'iqama_comment_author_employee')

const authorAvatarFile = alias(files, 'iqama_comment_author_avatar_file')

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
    return (
      tx
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

          employeeId: users.employeeId,

          /*
           * Return the file ID rather than storagePath.
           *
           * The service/controller can convert this into the same public URL
           * format already used by the employee profile.
           */
          authorAvatarFileId: authorAvatarFile.id,
          authorAvatarStorageKey: authorAvatarFile.storageKey,

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

        /*
         * Comment author account.
         */
        .innerJoin(users, eq(users.id, iqamaRenewalCaseComments.authorUserId))

        /*
         * Employee attached to the author account.
         *
         * This must remain a LEFT JOIN because some users may not have
         * an employee record.
         */
        .leftJoin(authorEmployee, eq(authorEmployee.id, users.employeeId))

        /*
         * Avatar attached to the author's employee record.
         *
         * This must also remain a LEFT JOIN because the avatar is optional.
         */
        // .leftJoin(
        //   authorAvatarFile,
        //   eq(authorAvatarFile.id, authorEmployee.avatarFileId),
        // )
        .leftJoin(
          authorAvatarFile,
          and(
            eq(authorAvatarFile.id, authorEmployee.avatarFileId),
            eq(authorAvatarFile.category, 'employee_avatar'),
            eq(authorAvatarFile.visibility, 'public'),
            // eq(authorAvatarFile.isDeleted, false),
            // isNull(authorAvatarFile.deletedAt),
          ),
        )

        .where(eq(iqamaRenewalCaseComments.caseId, caseId))
        .orderBy(
          asc(iqamaRenewalCaseComments.createdAt),
          asc(iqamaRenewalCaseComments.id),
        )
    )
  },
}
