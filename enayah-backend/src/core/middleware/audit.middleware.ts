import { Request, Response, NextFunction } from 'express'
import { auditLogger } from '../logging/auditLogger'

export const audit =
  (
    action: string,
    resource?: string,
    getResourceId?: (req: Request) => string | undefined,
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now()

    res.on('finish', () => {
      void (async () => {
        try {
          const resourceId =
            res.locals?.resourceId ??
            getResourceId?.(req) ??
            (typeof req.params?.id === 'string' ? req.params.id : undefined)

          if (!resourceId && process.env.NODE_ENV !== 'production') {
            console.warn(
              `[AUDIT WARNING] Missing resourceId for action "${action}" on ${req.originalUrl}`,
            )
          }

          await auditLogger.log({
            action,

            ...(req.user?.id && { userId: req.user.id }),
            ...(resource && { resource }),
            ...(resourceId && { resourceId }),

            before: res.locals.before,
            after: res.locals.after,

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
