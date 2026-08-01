// enayah-backend/src/modules/hr/credentials/service/credential-document-processing.service.ts

import { createHash } from 'node:crypto'

import sharp from 'sharp'

import { AppError } from '../../../../core/errors/AppError'

const MAX_CREDENTIAL_DOCUMENT_SIZE = 2 * 1024 * 1024
const MAX_IMAGE_INPUT_PIXELS = 40_000_000

const ACCEPTED_IMAGE_FORMATS = new Set(['jpeg', 'png', 'webp'])

export type CredentialDocumentMimeType =
  | 'application/pdf'
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'

export type CredentialDocumentExtension = 'pdf' | 'jpg' | 'png' | 'webp'

export type ProcessedCredentialDocument = {
  buffer: Buffer
  mimeType: CredentialDocumentMimeType
  extension: CredentialDocumentExtension
  fileSize: number
  checksumSha256: string
}

// function isPdf(buffer: Buffer): boolean {
//   /*
//    * The PDF header should appear within the first 1024 bytes.
//    */
//   const header = buffer
//     .subarray(0, Math.min(buffer.length, 1024))
//     .toString('latin1')

//   return header.includes('%PDF-')
// }

function isPdf(buffer: Buffer): boolean {
  /*
   * Require the PDF signature at the start of the file.
   */
  return buffer.subarray(0, 5).toString('latin1') === '%PDF-'
}

function resolveImageType(format: string): {
  mimeType: CredentialDocumentMimeType
  extension: CredentialDocumentExtension
} {
  switch (format) {
    case 'jpeg':
      return {
        mimeType: 'image/jpeg',
        extension: 'jpg',
      }

    case 'png':
      return {
        mimeType: 'image/png',
        extension: 'png',
      }

    case 'webp':
      return {
        mimeType: 'image/webp',
        extension: 'webp',
      }

    default:
      throw new AppError(
        'The uploaded credential document is not a supported image.',
        415,
      )
  }
}

export async function processCredentialDocument(
  file: Express.Multer.File,
): Promise<ProcessedCredentialDocument> {
  if (file.size <= 0 || file.buffer.length <= 0) {
    throw new AppError('The uploaded credential document is empty.', 422)
  }

  if (
    file.size > MAX_CREDENTIAL_DOCUMENT_SIZE ||
    file.buffer.length > MAX_CREDENTIAL_DOCUMENT_SIZE
  ) {
    throw new AppError('The credential document must not exceed 2 MB.', 413)
  }

  let mimeType: CredentialDocumentMimeType
  let extension: CredentialDocumentExtension

  if (isPdf(file.buffer)) {
    mimeType = 'application/pdf'
    extension = 'pdf'
  } else {
    try {
      const metadata = await sharp(file.buffer, {
        failOn: 'warning',
        limitInputPixels: MAX_IMAGE_INPUT_PIXELS,
        limitInputChannels: 4,
        animated: false,
      }).metadata()

      if (!metadata.format || !ACCEPTED_IMAGE_FORMATS.has(metadata.format)) {
        throw new AppError(
          'The uploaded credential document is not a supported image.',
          415,
        )
      }

      if ((metadata.pages ?? 1) > 1) {
        throw new AppError(
          'Animated credential documents are not allowed.',
          422,
        )
      }

      if (
        !metadata.width ||
        !metadata.height ||
        metadata.width <= 0 ||
        metadata.height <= 0
      ) {
        throw new AppError(
          'The credential document dimensions could not be determined.',
          422,
        )
      }

      const detectedType = resolveImageType(metadata.format)

      mimeType = detectedType.mimeType
      extension = detectedType.extension
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error
      }

      throw new AppError(
        'The uploaded file is not a valid JPG, PNG, PDF, or WebP document.',
        422,
      )
    }
  }

  return {
    /*
     * Preserve the submitted credential evidence.
     * Do not resize or convert it as you do with avatars.
     */
    buffer: file.buffer,
    mimeType,
    extension,
    fileSize: file.buffer.length,

    checksumSha256: createHash('sha256').update(file.buffer).digest('hex'),
  }
}
