import { Request, Response, NextFunction } from 'express'
import { AppError } from './AppError'
import { logger } from '../logging/logger'
import { ZodError } from 'zod'
import { fi } from 'zod/locales'

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = err.statusCode || 500

  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.url,

    cause: err?.cause?.message,
    code: err?.cause?.code,
    detail: err?.cause?.detail,
    constraint: err?.cause?.constraint,
  })

  if (err instanceof ZodError) {
    //const firstError = err.issues[0]
    return res.status(400).json({
      error: 'Validation Error',
      message: `Validation Failed`,
      details: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  if (err instanceof AppError) {
    logger.warn('Operational error occurred')
    return res.status(statusCode).json({
      message: err.message,
    })
  }

  // 🔥 HANDLE POSTGRES ERRORS PROPERLY
  if (err?.cause?.code) {
    switch (err.cause.code) {
      case '23505': // unique violation
        return res.status(409).json({
          message: 'Duplicate value violates unique constraint',
          field: err.cause.constraint,
        })

      case '23503': // foreign key violation
        return res.status(400).json({
          message: 'Invalid reference (foreign key constraint)',
        })

      case '23502': // not null violation
        return res.status(400).json({
          message: `Missing required field: ${err.cause.column}`,
        })

      default:
        return res.status(400).json({
          message: err.cause.message,
        })
    }
  }

  res.status(statusCode).json({
    message: err?.cause?.message || err.message || 'Internal Server Error',
  })
}
