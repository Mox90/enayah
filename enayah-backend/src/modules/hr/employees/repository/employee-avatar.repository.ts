// enayah-backend/src/modules/hr/employees/repository/employee-avatar.repository.ts

import { and, eq, isNull, sql } from 'drizzle-orm'
import { employees, files } from '../../../../db/schema'
import { DB } from '../../../../db'

//import type { DB } from '@/database/types'
// import {
//   employees,
//   files,
// } from '@/database/schema'

export type EmployeeAvatarForUpdate = {
  employeeId: string
  avatarFileId: string | null
  avatarStorageKey: string | null
  avatarCategory: (typeof files.category.enumValues)[number] | null
}

export type CreateEmployeeAvatarFileInput = {
  storedName: string
  originalName: string
  mimeType: 'image/webp'
  fileSize: number
  storageKey: string
  checksumSha256: string
  uploadedByUserId: string
}

export const employeeAvatarRepository = {
  findEmployeeForAvatarUpdate: async (
    tx: DB,
    employeeId: string,
  ): Promise<EmployeeAvatarForUpdate | null> => {
    /*
     * Serialize simultaneous avatar updates
     * for the same employee.
     */
    await tx.execute(sql`
        SELECT ${employees.id}
        FROM ${employees}
        WHERE
          ${employees.id} = ${employeeId}
          AND ${employees.isDeleted} = false
          AND ${employees.deletedAt} IS NULL
        FOR UPDATE
      `)

    const [employee] = await tx
      .select({
        employeeId: employees.id,
        avatarFileId: employees.avatarFileId,
        avatarStorageKey: files.storageKey,
        avatarCategory: files.category,
      })
      .from(employees)
      .leftJoin(files, eq(employees.avatarFileId, files.id))
      .where(
        and(
          eq(employees.id, employeeId),
          eq(employees.isDeleted, false),
          isNull(employees.deletedAt),
        ),
      )
      .limit(1)

    if (!employee) {
      return null
    }

    return {
      employeeId: employee.employeeId,
      avatarFileId: employee.avatarFileId,
      avatarStorageKey: employee.avatarStorageKey,
      avatarCategory: employee.avatarCategory,
    }
  },

  createAvatarFile: async (
    tx: DB,
    input: CreateEmployeeAvatarFileInput,
  ): Promise<{
    id: string
    storageKey: string
  }> => {
    const [createdFile] = await tx
      .insert(files)
      .values({
        storedName: input.storedName,
        originalName: input.originalName,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        storageKey: input.storageKey,
        checksumSha256: input.checksumSha256,

        visibility: 'public',
        category: 'employee_avatar',

        uploadedByUserId: input.uploadedByUserId,
      })
      .returning({
        id: files.id,
        storageKey: files.storageKey,
      })

    if (!createdFile) {
      throw new Error('The avatar file record could not be created.')
    }

    return createdFile
  },

  updateEmployeeAvatar: async (
    tx: DB,
    employeeId: string,
    avatarFileId: string | null,
  ): Promise<void> => {
    const [updatedEmployee] = await tx
      .update(employees)
      .set({
        avatarFileId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(employees.id, employeeId),
          eq(employees.isDeleted, false),
          isNull(employees.deletedAt),
        ),
      )
      .returning({
        id: employees.id,
      })

    if (!updatedEmployee) {
      throw new Error('The employee avatar could not be updated.')
    }
  },

  softDeleteAvatarFile: async (tx: DB, fileId: string): Promise<void> => {
    await tx
      .update(files)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(files.id, fileId), eq(files.category, 'employee_avatar')))
  },
}
