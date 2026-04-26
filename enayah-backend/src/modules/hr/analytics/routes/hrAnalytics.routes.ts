import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { requirePermission } from '../../../../core/middleware/permission.middleware'
import { HrAnalyticsController } from '../controller/hrAnalytics.controller'

const router = Router()

router.use(requireAuth)

router.post(
  '/headcount',
  //requirePermission('analytics.view'),
  HrAnalyticsController.headcount,
)

export default router
