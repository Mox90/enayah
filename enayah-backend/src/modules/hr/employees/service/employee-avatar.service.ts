// enayah-backend/src/modules/hr/employees/service/employee-avatar.service.ts

// import { db } from '@/database'

// import {
//   buildPublicFileUrl,
//   createDatedStorageKey,
//   deleteStoredFile,
//   sanitizeOriginalFileName,
//   writeStoredFileAtomically,
// } from '@/core/utils/file-storage.util'

import { createEmployeeAvatarError } from '../../../../core/errors/employee-avatar.errors'
import {
  buildPublicFileUrl,
  createDatedStorageKey,
  deleteStoredFile,
  sanitizeOriginalFileName,
  writeStoredFileAtomically,
} from '../../../../core/utils/file-storage.util'
import { db } from '../../../../db'
import type {
  EmployeeAvatarRemoveResponse,
  EmployeeAvatarUploadResponse,
} from '../dto/employee-avatar.dto'

import { employeeAvatarRepository } from '../repository/employee-avatar.repository'

// import { EmployeeAvatarError } from './employee-avatar.error'

import { processEmployeeAvatarImage } from './employee-avatar-image.service'

export type UploadEmployeeAvatarInput = {
  employeeId: string
  uploadedByUserId: string
  file: Express.Multer.File
}

export type RemoveEmployeeAvatarInput = {
  employeeId: string
}

async function removeOldAvatarSafely(storageKey: string | null): Promise<void> {
  if (!storageKey) {
    return
  }

  try {
    await deleteStoredFile('public', storageKey)
  } catch (error: unknown) {
    /*
     * Replace this with your central logger
     * when available.
     */
    console.error('Unable to delete previous employee avatar.', {
      storageKey,
      error,
    })
  }
}

export const employeeAvatarService = {
  upload: async ({
    employeeId,
    uploadedByUserId,
    file,
  }: UploadEmployeeAvatarInput): Promise<EmployeeAvatarUploadResponse> => {
    const processedAvatar = await processEmployeeAvatarImage(file)

    const { storageKey, storedName } = createDatedStorageKey(
      'employee-avatars',
      processedAvatar.extension,
    )

    try {
      await writeStoredFileAtomically(
        'public',
        storageKey,
        processedAvatar.buffer,
      )
    } catch (error: unknown) {
      throw createEmployeeAvatarError(
        'AVATAR_STORAGE_FAILED',
        'The employee avatar could not be stored.',
        500,
      )
    }

    let previousAvatarStorageKey: string | null = null

    let result: EmployeeAvatarUploadResponse

    try {
      result = await db.transaction(async (tx) => {
        const employee =
          await employeeAvatarRepository.findEmployeeForAvatarUpdate(
            tx,
            employeeId,
          )

        if (!employee) {
          throw createEmployeeAvatarError(
            'EMPLOYEE_NOT_FOUND',
            'Employee not found.',
            404,
          )
        }

        previousAvatarStorageKey = employee.avatarStorageKey

        const avatarFile = await employeeAvatarRepository.createAvatarFile(tx, {
          storedName,
          originalName: sanitizeOriginalFileName(file.originalname),
          mimeType: processedAvatar.mimeType,
          fileSize: processedAvatar.fileSize,
          storageKey,
          checksumSha256: processedAvatar.checksumSha256,
          uploadedByUserId,
        })

        await employeeAvatarRepository.updateEmployeeAvatar(
          tx,
          employeeId,
          avatarFile.id,
        )

        if (employee.avatarFileId) {
          await employeeAvatarRepository.softDeleteAvatarFile(
            tx,
            employee.avatarFileId,
          )
        }

        return {
          avatarFileId: avatarFile.id,
          avatarUrl: buildPublicFileUrl(avatarFile.storageKey),
          mimeType: processedAvatar.mimeType,
          fileSize: processedAvatar.fileSize,
          checksumSha256: processedAvatar.checksumSha256,
        }
      })
    } catch (error: unknown) {
      /*
       * The database transaction did not
       * commit, so remove the newly stored
       * physical file.
       */
      await deleteStoredFile('public', storageKey).catch(
        (cleanupError: unknown) => {
          console.error('Unable to clean up a failed avatar upload.', {
            storageKey,
            cleanupError,
          })
        },
      )

      throw error
    }

    /*
     * Delete the old physical file only after
     * the new database state has committed.
     */
    await removeOldAvatarSafely(previousAvatarStorageKey)

    return result
  },

  remove: async ({
    employeeId,
  }: RemoveEmployeeAvatarInput): Promise<EmployeeAvatarRemoveResponse> => {
    let previousAvatarStorageKey: string | null = null

    await db.transaction(async (tx) => {
      const employee =
        await employeeAvatarRepository.findEmployeeForAvatarUpdate(
          tx,
          employeeId,
        )

      if (!employee) {
        throw createEmployeeAvatarError(
          'EMPLOYEE_NOT_FOUND',
          'Employee not found.',
          404,
        )
      }

      previousAvatarStorageKey = employee.avatarStorageKey

      await employeeAvatarRepository.updateEmployeeAvatar(tx, employeeId, null)

      if (employee.avatarFileId) {
        await employeeAvatarRepository.softDeleteAvatarFile(
          tx,
          employee.avatarFileId,
        )
      }
    })

    await removeOldAvatarSafely(previousAvatarStorageKey)

    return {
      avatarFileId: null,
      avatarUrl: null,
    }
  },
}
