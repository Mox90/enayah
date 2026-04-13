import { logger } from './logger'

export const siemLog = (event: {
  type: string
  userId?: string
  ip?: string
  metadata?: any
}) => {
  logger.warn({
    siem: true,
    ...event,
    timestamp: new Date().toISOString(),
  })
}
