// enayah-backednd/src/core/utils/file-storage.utils.ts

import { randomUUID } from 'node:crypto'
import { mkdir, rename, unlink, writeFile } from 'node:fs/promises'
import { basename, dirname, resolve, sep } from 'node:path'
import { posix } from 'node:path'

export type FileStorageVisibility = 'public' | 'private'

function getRequiredStorageRoot(visibility: FileStorageVisibility): string {
  const environmentVariable =
    visibility === 'public'
      ? process.env.PUBLIC_FILE_STORAGE_ROOT
      : process.env.PRIVATE_FILE_STORAGE_ROOT

  if (!environmentVariable) {
    throw new Error(
      visibility === 'public'
        ? 'PUBLIC_FILE_STORAGE_ROOT is not configured.'
        : 'PRIVATE_FILE_STORAGE_ROOT is not configured.',
    )
  }

  return resolve(environmentVariable)
}

export function getPublicFileStorageRoot(): string {
  return getRequiredStorageRoot('public')
}

export function getPrivateFileStorageRoot(): string {
  return getRequiredStorageRoot('private')
}

/**
 * Generates keys such as:
 *
 * employee-avatars/2026/07/<uuid>.webp
 */
export function createDatedStorageKey(
  directory: string,
  extension: string,
): {
  storageKey: string
  storedName: string
} {
  const now = new Date()

  const year = String(now.getUTCFullYear())

  const month = String(now.getUTCMonth() + 1).padStart(2, '0')

  const normalizedExtension = extension.replace(/^\./, '').toLowerCase()

  const storedName = `${randomUUID()}.${normalizedExtension}`

  const storageKey = posix.join(directory, year, month, storedName)

  return {
    storageKey,
    storedName,
  }
}

function validateStorageKey(storageKey: string): string[] {
  if (
    !storageKey ||
    storageKey.startsWith('/') ||
    storageKey.includes('\\') ||
    storageKey.includes('\0')
  ) {
    throw new Error('Invalid file storage key.')
  }

  const segments = storageKey.split('/')

  if (
    segments.some((segment) => !segment || segment === '.' || segment === '..')
  ) {
    throw new Error('Invalid file storage key.')
  }

  return segments
}

export function resolveStoredFilePath(
  visibility: FileStorageVisibility,
  storageKey: string,
): string {
  const root = getRequiredStorageRoot(visibility)

  const segments = validateStorageKey(storageKey)

  const absolutePath = resolve(root, ...segments)

  const rootPrefix = root.endsWith(sep) ? root : `${root}${sep}`

  if (!absolutePath.startsWith(rootPrefix)) {
    throw new Error('The resolved file path is outside the storage root.')
  }

  return absolutePath
}

export async function writeStoredFileAtomically(
  visibility: FileStorageVisibility,
  storageKey: string,
  contents: Buffer,
): Promise<string> {
  const absolutePath = resolveStoredFilePath(visibility, storageKey)

  const temporaryPath = `${absolutePath}.tmp-${randomUUID()}`

  await mkdir(dirname(absolutePath), {
    recursive: true,
  })

  try {
    await writeFile(temporaryPath, contents, {
      flag: 'wx',
    })

    await rename(temporaryPath, absolutePath)

    return absolutePath
  } catch (error: unknown) {
    await unlink(temporaryPath).catch(() => undefined)

    throw error
  }
}

export async function deleteStoredFile(
  visibility: FileStorageVisibility,
  storageKey: string,
): Promise<void> {
  const absolutePath = resolveStoredFilePath(visibility, storageKey)

  try {
    await unlink(absolutePath)
  } catch (error: unknown) {
    const nodeError = error as NodeJS.ErrnoException

    if (nodeError.code === 'ENOENT') {
      return
    }

    throw error
  }
}

export function buildPublicFileUrl(storageKey: string): string {
  validateStorageKey(storageKey)

  return `/uploads/${storageKey}`
}

export function sanitizeOriginalFileName(originalName: string): string {
  const sanitizedName = basename(originalName)
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()

  return sanitizedName.slice(0, 255) || 'employee-avatars'
}
