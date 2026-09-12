// enayah-backend/src/modules/hr/dashboard/routes/hr-dashboard.routes.ts

import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { HrDashboardController } from '../controller/hr-dashboard.controller'

const router = Router()
router.use(requireAuth)
router.use(attachPermissions)

router.get(
  '/hr-admin/summary',
  requirePermission('hr.dashboard.view'),
  HrDashboardController.getAdminSummary,
)

router.get(
  '/hr-admin/activity',
  requirePermission('hr.dashboard.view'),
  HrDashboardController.getHiringTrend,
)

router.get(
  '/hr-admin/turnover/monthly',
  requirePermission('hr.dashboard.view'),
  HrDashboardController.getMonthlyTurnover,
)

export default router
