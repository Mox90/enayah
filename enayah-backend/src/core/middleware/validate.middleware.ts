import { Request, Response, NextFunction } from 'express'
import { ZodType } from 'zod'

type Schema = {
  params?: ZodType
  body?: ZodType
  query?: ZodType
}

export const validate =
  (schema: Schema) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validated: any = {}

      if (schema.params) {
        validated.params = schema.params.parse(req.params)
      }

      if (schema.body) {
        validated.body = schema.body.parse(req.body)
      }

      if (schema.query) {
        validated.query = schema.query.parse(req.query)
      }

      req.validated = validated

      next()
    } catch (error: any) {
      next(error)
    }
  }
