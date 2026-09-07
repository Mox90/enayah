import { Router } from 'express'

import { audit } from '../../../../core/middleware/audit.middleware'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { getParam } from '../../../../core/utils/request.utils'

import { OffboardingController } from '../controller/offboarding.controller'

const router = Router()

router.use(requireAuth)
router.use(attachPermissions)

// ----------------------------------
// Read
// ----------------------------------

router.get(
  '/employments/:employmentId/separations',
  requirePermission('employee.view'),
  OffboardingController.getEmploymentSeparations,
)

router.get(
  '/separations/:separationId',
  requirePermission('employee.view'),
  OffboardingController.getSeparation,
)

// ----------------------------------
// Create
// ----------------------------------

router.post(
  '/employments/:employmentId/separations',
  requirePermission('employee.update'),
  audit('EMPLOYMENT_SEPARATION_CREATE', {
    resource: 'EMPLOYMENT',
    getResourceId: (req) => getParam(req.params.employmentId),
  }),
  OffboardingController.createSeparation,
)

// ----------------------------------
// Update draft
// ----------------------------------

router.patch(
  '/separations/:separationId',
  requirePermission('employee.update'),
  audit('EMPLOYMENT_SEPARATION_UPDATE', {
    resource: 'EMPLOYMENT_SEPARATION',
    getResourceId: (req) => getParam(req.params.separationId),
  }),
  OffboardingController.updateSeparation,
)

// ----------------------------------
// Submit
// ----------------------------------

router.post(
  '/separations/:separationId/submit',
  requirePermission('employee.update'),
  audit('EMPLOYMENT_SEPARATION_SUBMIT', {
    resource: 'EMPLOYMENT_SEPARATION',
    getResourceId: (req) => getParam(req.params.separationId),
  }),
  OffboardingController.submitSeparation,
)

// ----------------------------------
// Approve
// ----------------------------------

router.post(
  '/separations/:separationId/approve',
  requirePermission('employee.update'),
  audit('EMPLOYMENT_SEPARATION_APPROVE', {
    resource: 'EMPLOYMENT_SEPARATION',
    getResourceId: (req) => getParam(req.params.separationId),
  }),
  OffboardingController.approveSeparation,
)

// ----------------------------------
// Cancel
// ----------------------------------

router.post(
  '/separations/:separationId/cancel',
  requirePermission('employee.update'),
  audit('EMPLOYMENT_SEPARATION_CANCEL', {
    resource: 'EMPLOYMENT_SEPARATION',
    getResourceId: (req) => getParam(req.params.separationId),
  }),
  OffboardingController.cancelSeparation,
)

// ----------------------------------
// Complete
// ----------------------------------

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
