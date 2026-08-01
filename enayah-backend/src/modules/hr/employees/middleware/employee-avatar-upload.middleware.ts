// enayah-backend/src/modules/hr/employees/middleware/employee-avatar-upload.middleware.ts

import type { NextFunction, Request, Response } from 'express'
import multer from 'multer'

import { AppError } from '../../../../core/errors/AppError'
import { createEmployeeAvatarError } from '../../../../core/errors/employee-avatar.errors'

const MAX_AVATAR_INPUT_SIZE = 2 * 1024 * 1024

const ACCEPTED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

const employeeAvatarUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_AVATAR_INPUT_SIZE,
    // files: 1,
    // fields: 0,
    // parts: 1,
    // fieldNestingDepth: 0,
    // fieldNameSize: 100,
    // headerPairs: 100,

    /*
     * Do not add parts: 1 here.
     * upload.single('avatar') already allows
     * exactly one file.
     */
  },

  fileFilter: (_request, file, callback) => {
    if (!ACCEPTED_AVATAR_TYPES.has(file.mimetype)) {
      callback(
        createEmployeeAvatarError(
          'AVATAR_TYPE_NOT_SUPPORTED',
          'Only JPG, PNG, and WebP images are supported.',
          415,
        ),
      )

      return
    }

    callback(null, true)
  },
})

const uploadSingleAvatar = employeeAvatarUpload.single('avatar')

export function uploadEmployeeAvatarMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  uploadSingleAvatar(request, response, (error: unknown) => {
    if (!error) {
      next()
      return
    }

    /*
     * Log the real Multer information temporarily.
     */
    console.error('Avatar Multer error:', {
      error,
      code: error instanceof multer.MulterError ? error.code : undefined,
      field: error instanceof multer.MulterError ? error.field : undefined,
    })

    if (error instanceof AppError) {
      next(error)
      return
    }

    if (error instanceof multer.MulterError) {
      switch (error.code) {
        case 'LIMIT_FILE_SIZE':
          next(
            createEmployeeAvatarError(
              'AVATAR_TOO_LARGE',
              'The avatar must not exceed 2 MB.',
              413,
            ),
          )
          return

        case 'LIMIT_FILE_COUNT':
          next(
            createEmployeeAvatarError(
              'AVATAR_UPLOAD_INVALID',
              'Only one avatar file is allowed.',
              400,
            ),
          )
          return

        case 'LIMIT_UNEXPECTED_FILE':
          next(
            createEmployeeAvatarError(
              'AVATAR_UPLOAD_INVALID',
              error.field
                ? `Unexpected file field "${error.field}". Use the field name "avatar".`
                : 'Unexpected avatar file field.',
              400,
            ),
          )
          return

        case 'LIMIT_FIELD_COUNT':
          next(
            createEmployeeAvatarError(
              'AVATAR_UPLOAD_INVALID',
              'Additional form fields are not allowed.',
              400,
            ),
          )
          return

        default:
          next(
            createEmployeeAvatarError(
              'AVATAR_UPLOAD_INVALID',
              'The avatar upload request is invalid.',
              400,
            ),
          )
          return
      }
    }

    next(
      createEmployeeAvatarError(
        'AVATAR_UPLOAD_FAILED',
        'The avatar upload could not be processed.',
        500,
      ),
    )
  })
}
