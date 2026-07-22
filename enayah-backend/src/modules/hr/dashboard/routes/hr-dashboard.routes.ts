// enayah-backend/src/modules/hr/dashboard/routes/hr-dashboard.routes.ts

import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { HrDashboardController } from '../controller/hr-dashboard.controller'

//import { requireAuth } from '../../../iam/middleware/require-auth'
//import { attachPermissions } from '../../../iam/middleware/attach-permissions'
//import { requirePermission } from '../../../iam/middleware/require-permission'

//import { HrDashboardController } from '../controllers/hr-dashboard.controller'

const router = Router()
router.use(requireAuth)
router.use(attachPermissions)

router.get(
  '/hr-admin',
  // Use your existing permission initially, or replace this with
  // hr.dashboard.view when that permission exists.
  requirePermission('hr.dashboard.view'),
  HrDashboardController.getAdminDashboard,
)

export default router
