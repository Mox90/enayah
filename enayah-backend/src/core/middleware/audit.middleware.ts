import { Request, Response, NextFunction } from 'express'
import { auditLogger } from '../logging/auditLogger'
import { sanitizeObject } from '../utils/auditSanitizer'

type AuditOptions = {
  resource?: string
  getResourceId?: (req: Request) => string | undefined
  sanitize?: {
    allowList?: string[]
    redactFields?: string[]
  }
}

export const audit =
  (action: string, options?: AuditOptions) =>
  (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now()

    res.on('finish', () => {
      void (async () => {
        try {
          const resourceId =
            res.locals?.resourceId ??
            options?.getResourceId?.(req) ??
            (typeof req.params?.id === 'string' ? req.params.id : undefined)

          if (!resourceId && process.env.NODE_ENV !== 'production') {
            console.warn(
              `[AUDIT WARNING] Missing resourceId for action "${action}" on ${req.originalUrl}`,
            )
          }

          const beforeSanitized = sanitizeObject(
            res.locals.before,
            options?.sanitize,
          )

          const afterSanitized = sanitizeObject(
            res.locals.after,
            options?.sanitize,
          )

          await auditLogger.log({
            action,

            ...(req.user?.id && { userId: req.user.id }),
            ...(options?.resource && { resource: options.resource }),
            ...(resourceId && { resourceId }),

            //before: res.locals.before,
            //after: res.locals.after,
            ...(beforeSanitized !== undefined && { before: beforeSanitized }),
            ...(afterSanitized !== undefined && { after: afterSanitized }),

            metadata: {
              method: req.method,
              url: req.originalUrl,
              statusCode: res.statusCode,
              durationMs: Date.now() - start,
            },

            ...(req.requestContext?.ip && { ip: req.requestContext.ip }),
            ...(req.requestContext?.userAgent && {
              userAgent: req.requestContext.userAgent,
            }),
          })
        } catch (error) {
          console.error('Audit middleware error:', error)
        }
      })()
    })

    next()
  }
