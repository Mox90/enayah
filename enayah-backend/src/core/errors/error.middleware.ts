import type { ErrorRequestHandler, Request, Response } from 'express'
import { ZodError } from 'zod'

import { AppError } from './AppError'
import { logger } from '../logging/logger'

type DatabaseErrorDetails = {
  message?: string
  code?: string
  detail?: string
  column?: string
  constraint?: string
}

type ErrorWithStatus = DatabaseErrorDetails & {
  status?: number
  statusCode?: number
  stack?: string
  path?: string
  cause?: DatabaseErrorDetails
}

function isErrorWithStatus(error: unknown): error is ErrorWithStatus {
  return typeof error === 'object' && error !== null
}

export const globalErrorHandler: ErrorRequestHandler = (
  error: unknown,
  request: Request,
  response: Response,
  _next,
): void => {
  const normalizedError: ErrorWithStatus = isErrorWithStatus(error) ? error : {}

  /*
   * Zod validation errors
   */
  if (error instanceof ZodError) {
    logger.warn({
      message: 'Validation failed',
      path: request.originalUrl,
      issues: error.issues,
    })

    response.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed.',
        details: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    })

    return
  }

  /*
   * Operational application errors.
   *
   * Avatar errors created through
   * createEmployeeAvatarError() arrive here because
   * that helper returns an AppError.
   */
  if (error instanceof AppError) {
    logger.warn({
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      path: request.originalUrl,
      method: request.method,
    })

    response.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code ?? 'APPLICATION_ERROR',
        message: error.message,
      },

      /*
       * Optional backward compatibility for frontend
       * code that currently reads response.data.message.
       */
      message: error.message,
    })

    return
  }

  /*
   * PostgreSQL/Drizzle errors.
   *
   * Depending on how the error was wrapped, the
   * PostgreSQL code may be on error.cause or directly
   * on the error object.
   */
  const databaseError: DatabaseErrorDetails | undefined = normalizedError.cause
    ?.code
    ? normalizedError.cause
    : normalizedError.code
      ? normalizedError
      : undefined

  if (databaseError?.code) {
    logger.error({
      message:
        databaseError.message ?? normalizedError.message ?? 'Database error',
      code: databaseError.code,
      detail: databaseError.detail,
      column: databaseError.column,
      constraint: databaseError.constraint,
      path: request.originalUrl,
      method: request.method,
    })

    switch (databaseError.code) {
      case '23505':
        response.status(409).json({
          success: false,
          error: {
            code: 'UNIQUE_CONSTRAINT_VIOLATION',
            message: 'Duplicate value violates a unique constraint.',
            constraint: databaseError.constraint,
          },
          message: 'Duplicate value violates a unique constraint.',
        })
        return

      case '23503':
        response.status(400).json({
          success: false,
          error: {
            code: 'FOREIGN_KEY_VIOLATION',
            message: 'The supplied reference is invalid or still in use.',
            constraint: databaseError.constraint,
          },
          message: 'The supplied reference is invalid or still in use.',
        })
        return

      case '23502':
        response.status(400).json({
          success: false,
          error: {
            code: 'NOT_NULL_VIOLATION',
            message: databaseError.column
              ? `Missing required field: ${databaseError.column}.`
              : 'A required field is missing.',
          },
          message: databaseError.column
            ? `Missing required field: ${databaseError.column}.`
            : 'A required field is missing.',
        })
        return

      case '23514':
        response.status(422).json({
          success: false,
          error: {
            code: 'CHECK_CONSTRAINT_VIOLATION',
            message: 'The submitted value violates a database constraint.',
            constraint: databaseError.constraint,
          },
          message: 'The submitted value violates a database constraint.',
        })
        return

      default:
        response.status(400).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message:
              process.env.NODE_ENV === 'production'
                ? 'The database operation could not be completed.'
                : (databaseError.message ??
                  'The database operation could not be completed.'),
          },
          message:
            process.env.NODE_ENV === 'production'
              ? 'The database operation could not be completed.'
              : (databaseError.message ??
                'The database operation could not be completed.'),
        })
        return
    }
  }

  /*
   * Errors forwarded by express.static when
   * fallthrough is false.
   */
  const staticStatus = normalizedError.status ?? normalizedError.statusCode

  if (
    typeof staticStatus === 'number' &&
    staticStatus >= 400 &&
    staticStatus < 500
  ) {
    const isNotFound = staticStatus === 404

    logger.warn({
      message: normalizedError.message ?? 'Static file request failed',
      statusCode: staticStatus,
      path: request.originalUrl,
      method: request.method,
    })

    response.status(staticStatus).json({
      success: false,
      error: {
        code: isNotFound ? 'FILE_NOT_FOUND' : 'STATIC_FILE_ERROR',
        message: isNotFound
          ? 'The requested file was not found.'
          : 'The requested file could not be served.',
      },
      message: isNotFound
        ? 'The requested file was not found.'
        : 'The requested file could not be served.',
    })

    return
  }

  /*
   * Unexpected errors
   */
  logger.error({
    message: normalizedError.message ?? 'Internal Server Error',
    stack: normalizedError.stack,
    path: request.originalUrl,
    method: request.method,
    cause: normalizedError.cause?.message,
    causeCode: normalizedError.cause?.code,
    detail: normalizedError.cause?.detail,
    constraint: normalizedError.cause?.constraint,
  })

  response.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred.'
          : (normalizedError.message ?? 'Internal Server Error'),
    },
    message:
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred.'
        : (normalizedError.message ?? 'Internal Server Error'),
  })
}
