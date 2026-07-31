// enyah-backend/src/modules/hr/employees/service/employee-avatar-image.service.ts

import { createHash } from 'node:crypto'
import sharp from 'sharp'

import { AppError } from '../../../../core/errors/AppError'
import { createEmployeeAvatarError } from '../../../../core/errors/employee-avatar.errors'

const MAX_AVATAR_OUTPUT_SIZE = 2 * 1024 * 1024

const MAX_AVATAR_WIDTH = 1024
const MAX_AVATAR_HEIGHT = 1024

// 16 megapixels is already much larger than
// necessary for a profile avatar.
const MAX_AVATAR_INPUT_PIXELS = 16_000_000

const ACCEPTED_DECODED_FORMATS = new Set(['jpeg', 'png', 'webp'])

export type ProcessedEmployeeAvatar = {
  buffer: Buffer
  mimeType: 'image/webp'
  extension: 'webp'
  fileSize: number
  checksumSha256: string
  width: number
  height: number
}

export async function processEmployeeAvatarImage(
  file: Express.Multer.File,
): Promise<ProcessedEmployeeAvatar> {
  if (file.size <= 0 || file.buffer.length <= 0) {
    throw createEmployeeAvatarError(
      'AVATAR_IMAGE_INVALID',
      'The uploaded avatar is empty.',
      422,
    )
  }

  try {
    const image = sharp(file.buffer, {
      failOn: 'warning',

      // Prevent excessively large decoded images.
      limitInputPixels: MAX_AVATAR_INPUT_PIXELS,

      // RGB, RGBA, grayscale, or CMYK safety limit.
      limitInputChannels: 4,

      // Apply EXIF orientation.
      autoOrient: true,

      // Load only the first frame during processing.
      animated: false,
    })

    const metadata = await image.metadata()

    if (!metadata.format || !ACCEPTED_DECODED_FORMATS.has(metadata.format)) {
      throw createEmployeeAvatarError(
        'AVATAR_TYPE_NOT_SUPPORTED',
        'The uploaded file is not a supported image.',
        415,
      )
    }

    if ((metadata.pages ?? 1) > 1) {
      throw createEmployeeAvatarError(
        'AVATAR_ANIMATED_NOT_ALLOWED',
        'Animated employee avatars are not allowed.',
        422,
      )
    }

    if (
      !metadata.width ||
      !metadata.height ||
      metadata.width <= 0 ||
      metadata.height <= 0
    ) {
      throw createEmployeeAvatarError(
        'AVATAR_DIMENSIONS_INVALID',
        'The avatar dimensions could not be determined.',
        422,
      )
    }

    const result = await image
      .resize({
        width: MAX_AVATAR_WIDTH,
        height: MAX_AVATAR_HEIGHT,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: 85,
        effort: 4,
        smartSubsample: true,
      })
      .toBuffer({
        resolveWithObject: true,
      })

    if (
      result.data.length <= 0 ||
      result.data.length > MAX_AVATAR_OUTPUT_SIZE
    ) {
      throw createEmployeeAvatarError(
        'AVATAR_OUTPUT_TOO_LARGE',
        'The processed avatar exceeds 2 MB.',
        422,
      )
    }

    const checksumSha256 = createHash('sha256')
      .update(result.data)
      .digest('hex')

    return {
      buffer: result.data,
      mimeType: 'image/webp',
      extension: 'webp',
      fileSize: result.data.length,
      checksumSha256,
      width: result.info.width,
      height: result.info.height,
    }
  } catch (error: unknown) {
    /*
     * Preserve intentionally created operational errors,
     * such as unsupported format, animation, or dimensions.
     */
    if (error instanceof AppError) {
      throw error
    }

    /*
     * Convert unexpected Sharp decoding or processing
     * failures into a safe operational error.
     */
    throw createEmployeeAvatarError(
      'AVATAR_IMAGE_INVALID',
      'The uploaded file could not be decoded as a valid image.',
      422,
    )
  }
}
