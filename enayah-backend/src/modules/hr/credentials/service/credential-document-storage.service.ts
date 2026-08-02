// enayah-backend/src/modules/hr/credentials/service/credential-document-storage.service.ts

import { randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { AppError } from '../../../../core/errors/AppError'
import { getPrivateFileStorageRoot } from '../../../../core/utils/file-storage.util'

import type { ProcessedCredentialDocument } from './credential-document-processing.service'
import { lstat, realpath } from 'fs/promises'

const DEFAULT_TIME_ZONE = 'Asia/Riyadh'

export type CredentialDocumentKind =
  | 'degree'
  | 'board'
  | 'fellowship'
  | 'membership'
  | 'license'
  | 'life-support'
  | 'malpractice'
  | 'verification-evidence'

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

export type ResolvedCredentialDocument = {
  absolutePath: string
  fileSize: number
}

/**
 * Returns true only when childPath is located below parentPath.
 *
 * It rejects:
 * - the parent directory itself
 * - paths outside the parent
 * - absolute relative-path results
 */
function isPathInside(parentPath: string, childPath: string): boolean {
  const relativePath = path.relative(parentPath, childPath)

  return (
    relativePath.length > 0 &&
    relativePath !== '..' &&
    !relativePath.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePath)
  )
}

/**
 * Storage keys are stored in PostgreSQL using POSIX-style
 * forward slashes, for example:
 *
 * hr/2026/08/uuid-degree-document.pdf
 */
function normalizeStorageKey(storageKey: string): string {
  return storageKey.trim().replaceAll('\\', '/').replace(/^\/+/, '')
}

function getErrorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return null
  }

  const code = error.code

  return typeof code === 'string' ? code : null
}

/**
 * Resolves a credential storage key into a safe absolute
 * filesystem path under PRIVATE_FILE_STORAGE_ROOT.
 *
 * This function:
 * - rejects absolute paths
 * - rejects "." and ".." path segments
 * - restricts credentials to the "hr/" directory
 * - resolves symbolic links
 * - prevents symbolic links from escaping the private root
 * - confirms that the target is a regular file
 */
export async function resolveCredentialDocument(
  storageKey: string,
): Promise<ResolvedCredentialDocument> {
  const normalizedStorageKey = normalizeStorageKey(storageKey)

  if (!normalizedStorageKey) {
    throw new AppError('Credential document storage key is invalid.', 500)
  }

  if (normalizedStorageKey.includes('\0')) {
    throw new AppError('Credential document storage key is invalid.', 500)
  }

  const storageKeySegments = normalizedStorageKey.split('/')

  if (
    storageKeySegments.some(
      (segment) => segment === '' || segment === '.' || segment === '..',
    )
  ) {
    throw new AppError('Credential document storage key is invalid.', 500)
  }

  /*
   * Credential evidence must always live below:
   *
   * PRIVATE_FILE_STORAGE_ROOT/hr/
   */
  if (storageKeySegments[0] !== 'hr') {
    throw new AppError('Credential document storage key is invalid.', 500)
  }

  const configuredPrivateRoot = path.resolve(getPrivateFileStorageRoot())

  const candidatePath = path.resolve(
    configuredPrivateRoot,
    ...storageKeySegments,
  )

  /*
   * Check the unresolved candidate first.
   *
   * This rejects straightforward traversal attempts before
   * accessing the filesystem.
   */
  if (!isPathInside(configuredPrivateRoot, candidatePath)) {
    throw new AppError('Credential document storage key is invalid.', 500)
  }

  try {
    /*
     * realpath resolves symbolic links. Checking containment
     * again after realpath prevents a symlink inside the private
     * directory from pointing outside it.
     */
    const resolvedPrivateRoot = await realpath(configuredPrivateRoot)

    const resolvedFilePath = await realpath(candidatePath)

    if (!isPathInside(resolvedPrivateRoot, resolvedFilePath)) {
      throw new AppError('Credential document path is invalid.', 500)
    }

    const fileStats = await lstat(resolvedFilePath)

    if (!fileStats.isFile()) {
      throw new AppError('Credential document is not a regular file.', 500)
    }

    return {
      absolutePath: resolvedFilePath,
      fileSize: fileStats.size,
    }
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error
    }

    const errorCode = getErrorCode(error)

    if (errorCode === 'ENOENT' || errorCode === 'ENOTDIR') {
      /*
       * The database contains a storage key, but the matching
       * physical file or directory is missing.
       */
      throw new AppError('Credential document is unavailable.', 500)
    }

    if (errorCode === 'EACCES' || errorCode === 'EPERM') {
      throw new AppError('Credential document cannot be accessed.', 500)
    }

    throw error
  }
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
