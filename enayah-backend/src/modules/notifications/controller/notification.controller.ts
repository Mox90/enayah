// src/modules/notifications/controller/notification.controller.ts

import { Request, Response } from 'express'
import { asyncHandler } from '../../../core/utils/asyncHandler'
import { db } from '../../../db'
import { NotificationRepository } from '../repository/notification.repository'
import { NotificationGeneratorService } from '../service/notification-generator.service'
import { NotificationIdSchema } from '../types/notification.schema'

export const NotificationController = {
  mine: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id

    const result = await NotificationRepository.findMyNotifications(db, userId)

    res.json(result)
  }),

  markAsRead: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id
    const { id } = NotificationIdSchema.parse(req.params)

    const result = await NotificationRepository.markAsRead(db, id, userId)

    res.json(result)
  }),

  archive: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id
    const { id } = NotificationIdSchema.parse(req.params)

    const result = await NotificationRepository.archive(db, id, userId)

    res.json(result)
  }),

  generateIqamaExpiryAlerts: asyncHandler(
    async (_req: Request, res: Response) => {
      const result =
        await NotificationGeneratorService.generateIqamaExpiryAlerts()

      res.json(result)
    },
  ),
}
