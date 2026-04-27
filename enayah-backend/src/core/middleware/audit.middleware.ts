import { Request, Response, NextFunction } from 'express'
import { auditLogger } from '../logging/auditLogger'
import { sanitizeObject } from '../utils/audit.sanitizer'

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

            // WHO did
            ...(req.user?.id && { userId: req.user.id }),

            // WHERE it happened
            ...(options?.resource && { resource: options.resource }),
            ...(resourceId && { resourceId }),

            // WHAT are the things that changed
            ...(beforeSanitized !== undefined && { before: beforeSanitized }),
            ...(afterSanitized !== undefined && { after: afterSanitized }),

            // COMPLIANCE (top-level so the repository persists them)
            //            success: res.statusCode < 400,
            //            ...(req.requestContext?.requestId && {
            //              requestId: req.requestContext.requestId,
            //            }),
            //            ...(options?.resource && { module: options.resource }),

            // HOW it changed
            metadata: {
              method: req.method,
              url: req.originalUrl,
              route: req.route?.path,
              statusCode: res.statusCode,
              durationMs: Date.now() - start,
              success: res.statusCode < 400,
              requestId: req.requestContext?.requestId,
            },

            // CONTEXT
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
