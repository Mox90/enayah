import { AppError } from './AppError'

export type EmployeeAvatarErrorCode =
  | 'EMPLOYEE_NOT_FOUND'
  | 'AUTHENTICATED_USER_REQUIRED'
  | 'AVATAR_FILE_REQUIRED'
  | 'AVATAR_TOO_LARGE'
  | 'AVATAR_TYPE_NOT_SUPPORTED'
  | 'AVATAR_IMAGE_INVALID'
  | 'AVATAR_ANIMATED_NOT_ALLOWED'
  | 'AVATAR_DIMENSIONS_INVALID'
  | 'AVATAR_OUTPUT_TOO_LARGE'
  | 'AVATAR_STORAGE_FAILED'
  | 'AVATAR_UPLOAD_INVALID'
  | 'AVATAR_UPLOAD_FAILED'

export function createEmployeeAvatarError(
  code: EmployeeAvatarErrorCode,
  message: string,
  statusCode: number,
): AppError {
  return new AppError(message, statusCode, code)
}
