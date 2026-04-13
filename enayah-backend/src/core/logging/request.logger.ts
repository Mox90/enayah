import { NextFunction, Request, Response } from 'express'
import { logger } from './logger'

export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  logger.info(`${req.method} ${req.url}`)
  next()
}
