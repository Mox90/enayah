// enayah-backend/src/modules/hr/offboarding/routes/offboarding.routes.ts

import { Router } from 'express'

import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'

import { OffboardingController } from '../controller/offboarding.controller'
import { getParam } from '../../../../core/utils/request.utils'

const router = Router()

router.use(requireAuth)
router.use(attachPermissions)

router.post(
  '/employments/:employmentId/separations',
  requirePermission('employee.update'),

  audit('EMPLOYMENT_SEPARATION_CREATE', {
    resource: 'EMPLOYMENT',
    getResourceId: (req) => getParam(req.params.employmentId),
  }),

  OffboardingController.createSeparation,
)

router.post(
  '/separations/:separationId/complete',
  requirePermission('employee.update'),

  audit('EMPLOYMENT_SEPARATION_COMPLETE', {
    resource: 'EMPLOYMENT_SEPARATION',
    getResourceId: (req) => getParam(req.params.separationId),
  }),

  OffboardingController.completeSeparation,
)

export default router
