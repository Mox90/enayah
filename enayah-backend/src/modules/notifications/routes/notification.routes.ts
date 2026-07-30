// src/modules/notifications/notification.routes.ts

import { Router } from 'express'
import { requireAuth } from '../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../core/middleware/permission.middleware'
import { NotificationController } from '../controller/notification.controller'

const router = Router()

router.use(requireAuth)
router.use(attachPermissions)

router.get('/', NotificationController.mine)

router.patch('/:id/read', NotificationController.markAsRead)

router.patch('/:id/archive', NotificationController.archive)

router.post(
  '/generate-iqama-expiry-alerts',
  //requirePermission('notifications.generate'),
  NotificationController.generateIqamaExpiryAlerts,
)

export default router
