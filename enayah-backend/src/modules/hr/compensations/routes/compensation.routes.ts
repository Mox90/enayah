import { Router } from 'express'
import { CompensationController } from '../controller/compensation.controller'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { requirePermission } from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'
import { getParam } from '../../../../core/utils/request.utils'

const router = Router()

router.use(requireAuth)

router.post(
  '/',
  requirePermission('compensation.create'),
  audit('CREATE_COMPENSATION', {
    resource: 'COMPENSATION',
  }),
  CompensationController.create,
)

router.post(
  '/:id/approve',
  requirePermission('compensation.approve'),
  audit('APPROVE_COMPENSATION', {
    resource: 'COMPENSATION',
  }),
  CompensationController.approve,
)

router.get(
  '/:id',
  requirePermission('employee.view'),
  CompensationController.findById,
)

router.patch(
  '/:id',
  requirePermission('employee.update'),
  audit('COMPENSATION_UPDATE', {
    resource: 'COMPENSATION',
    getResourceId: (req) => getParam(req.params.id),
  }),

  CompensationController.update,
)

router.patch(
  '/:id/approve',
  requirePermission('employee.update'),
  audit('COMPENSATION_APPROVE', {
    resource: 'COMPENSATION',
    getResourceId: (req) => getParam(req.params.id),
  }),

  CompensationController.approve,
)

router.patch(
  '/:id/apply',
  requirePermission('employee.update'),
  audit('COMPENSATION_APPLY', {
    resource: 'COMPENSATION',
    getResourceId: (req) => getParam(req.params.id),
  }),

  CompensationController.apply,
)

router.delete(
  '/:id',
  requirePermission('employee.update'),
  audit('COMPENSATION_DELETE', {
    resource: 'COMPENSATION',
    getResourceId: (req) => getParam(req.params.id),
  }),

  CompensationController.delete,
)

// Allowances

router.get(
  '/:id/allowances',
  requirePermission('employee.view'),
  CompensationController.findAllowances,
)

router.post(
  '/:id/allowances',
  requirePermission('employee.update'),
  audit('COMPENSATION_ALLOWANCE_CREATE', {
    resource: 'COMPENSATION_ALLOWANCE',
    getResourceId: (req) => getParam(req.params.id),
  }),

  CompensationController.createAllowance,
)

router.patch(
  '/allowances/:id',
  requirePermission('employee.update'),
  audit('COMPENSATION_ALLOWANCE_UPDATE', {
    resource: 'COMPENSATION_ALLOWANCE',
    getResourceId: (req) => getParam(req.params.id),
  }),

  CompensationController.updateAllowance,
)

router.delete(
  '/allowances/:id',
  requirePermission('employee.update'),
  audit('COMPENSATION_ALLOWANCE_DELETE', {
    resource: 'COMPENSATION_ALLOWANCE',
    getResourceId: (req) => getParam(req.params.id),
  }),

  CompensationController.deleteAllowance,
)

export default router
