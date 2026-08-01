// enayah-backend/src/modules/hr/credentials/middleware/credential-document-upload.middleware.ts

import path from 'node:path'

import type { NextFunction, Request, Response } from 'express'
import multer from 'multer'

import { AppError } from '../../../../core/errors/AppError'

export const MAX_CREDENTIAL_DOCUMENT_SIZE = 2 * 1024 * 1024

const ACCEPTED_CREDENTIAL_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])

const ACCEPTED_CREDENTIAL_EXTENSIONS = new Set([
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
])

const credentialDocumentUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_CREDENTIAL_DOCUMENT_SIZE,
    files: 1,
  },

  fileFilter: (_request, file, callback) => {
    const mimeType = file.mimetype.toLowerCase()
    const extension = path.extname(file.originalname).toLowerCase()

    /*
     * This is only the initial validation layer.
     *
     * The processing service must still validate the real
     * file content before storing it.
     */
    if (
      !ACCEPTED_CREDENTIAL_MIME_TYPES.has(mimeType) &&
      !ACCEPTED_CREDENTIAL_EXTENSIONS.has(extension)
    ) {
      callback(
        new AppError(
          'Only JPG, PNG, PDF, and WebP documents are supported.',
          415,
        ),
      )

      return
    }

    callback(null, true)
  },
})

const uploadSingleCredentialDocument =
  credentialDocumentUpload.single('document')

export function uploadCredentialDocumentMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  uploadSingleCredentialDocument(request, response, (error: unknown) => {
    if (!error) {
      next()
      return
    }

    if (error instanceof AppError) {
      next(error)
      return
    }

    if (error instanceof multer.MulterError) {
      switch (error.code) {
        case 'LIMIT_FILE_SIZE':
          next(
            new AppError('The credential document must not exceed 2 MB.', 413),
          )
          return

        case 'LIMIT_FILE_COUNT':
          next(new AppError('Only one credential document is allowed.', 400))
          return

        case 'LIMIT_UNEXPECTED_FILE':
          next(
            new AppError(
              error.field
                ? `Unexpected file field "${error.field}". Use the field name "document".`
                : 'Unexpected credential document field.',
              400,
            ),
          )
          return

        default:
          next(
            new AppError(
              'The credential document upload request is invalid.',
              400,
            ),
          )
          return
      }
    }

    next(
      new AppError(
        'The credential document upload could not be processed.',
        500,
      ),
    )
  })
}
