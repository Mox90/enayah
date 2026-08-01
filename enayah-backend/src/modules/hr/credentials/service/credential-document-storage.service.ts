// enayah-backend/src/modules/hr/credentials/service/credential-document-storage.service.ts

import { randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { AppError } from '../../../../core/errors/AppError'
import { getPrivateFileStorageRoot } from '../../../../core/utils/file-storage.util'

import type { ProcessedCredentialDocument } from './credential-document-processing.service'

const DEFAULT_TIME_ZONE = 'Asia/Riyadh'

export type CredentialDocumentKind =
  | 'degree'
  | 'board'
  | 'fellowship'
  | 'membership'
  | 'license'
  | 'life-support'
  | 'malpractice'

export type StoredCredentialDocument = {
  storedName: string
  originalName: string
  storageKey: string
  absolutePath: string
}

function getStorageYearMonth(now: Date): {
  year: string
  month: string
} {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: process.env.APP_TIME_ZONE ?? DEFAULT_TIME_ZONE,

    year: 'numeric',
    month: '2-digit',
  })

  const parts = formatter.formatToParts(now)

  const year = parts.find((part) => part.type === 'year')?.value

  const month = parts.find((part) => part.type === 'month')?.value

  if (!year || !month) {
    throw new AppError(
      'Unable to determine the credential document storage date.',
      500,
    )
  }

  return {
    year,
    month,
  }
}

function getBaseName(originalName: string): string {
  /*
   * Replace Windows separators so path segments from a
   * client-supplied name can never become directories.
   */
  return path.posix.basename(originalName.replaceAll('\\', '/'))
}

function normalizeOriginalName(
  originalName: string,
  fallbackName: string,
): string {
  const normalizedName = getBaseName(originalName)
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, 255)

  return normalizedName || fallbackName
}

function createStoredName(
  originalName: string,
  extension: string,
  credentialKind: CredentialDocumentKind,
): string {
  const originalFileName = getBaseName(originalName)

  const originalBaseName = path.posix
    .basename(originalFileName, path.posix.extname(originalFileName))
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_.]+|[-_.]+$/g, '')
    .slice(0, 90)

  const safeBaseName = originalBaseName || `${credentialKind}-document`

  return `${randomUUID()}-${credentialKind}-${safeBaseName}.${extension}`
}

function resolvePrivateStoragePath(storageKey: string): string {
  const privateStorageRoot = path.resolve(getPrivateFileStorageRoot())

  const absolutePath = path.resolve(
    privateStorageRoot,
    ...storageKey.split('/'),
  )

  if (
    absolutePath !== privateStorageRoot &&
    !absolutePath.startsWith(`${privateStorageRoot}${path.sep}`)
  ) {
    throw new AppError('The private file storage path is invalid.', 500)
  }

  return absolutePath
}

function assertPrivateAbsolutePath(absolutePath: string): string {
  const privateStorageRoot = path.resolve(getPrivateFileStorageRoot())

  const resolvedPath = path.resolve(absolutePath)

  if (
    resolvedPath !== privateStorageRoot &&
    !resolvedPath.startsWith(`${privateStorageRoot}${path.sep}`)
  ) {
    throw new AppError('The private file storage path is invalid.', 500)
  }

  return resolvedPath
}

export async function storeCredentialDocument({
  document,
  originalName,
  credentialKind,
  now = new Date(),
}: {
  document: ProcessedCredentialDocument
  originalName: string
  credentialKind: CredentialDocumentKind
  now?: Date
}): Promise<StoredCredentialDocument> {
  const { year, month } = getStorageYearMonth(now)

  const storedName = createStoredName(
    originalName,
    document.extension,
    credentialKind,
  )

  const storageKey = path.posix.join('hr', year, month, storedName)

  const absolutePath = resolvePrivateStoragePath(storageKey)

  await mkdir(path.dirname(absolutePath), {
    recursive: true,
  })

  await writeFile(absolutePath, document.buffer, {
    flag: 'wx',
    mode: 0o600,
  })

  return {
    storedName,

    originalName: normalizeOriginalName(originalName, storedName),

    storageKey,
    absolutePath,
  }
}

export async function removeCredentialDocument(
  storageKey: string,
): Promise<void> {
  const absolutePath = resolvePrivateStoragePath(storageKey)

  try {
    await unlink(absolutePath)
  } catch (error: unknown) {
    const nodeError = error as NodeJS.ErrnoException

    if (nodeError.code !== 'ENOENT') {
      throw error
    }
  }
}

export async function removeCredentialDocumentByAbsolutePath(
  absolutePath: string,
): Promise<void> {
  const resolvedPath = assertPrivateAbsolutePath(absolutePath)

  try {
    await unlink(resolvedPath)
  } catch (error: unknown) {
    const nodeError = error as NodeJS.ErrnoException

    if (nodeError.code !== 'ENOENT') {
      throw error
    }
  }
}
