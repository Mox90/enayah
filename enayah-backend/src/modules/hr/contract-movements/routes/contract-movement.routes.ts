import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { ContractMovementController } from '../controller/contract-movement.controller'
import { CompensationController } from '../../compensations/controller/compensation.controller'
import { audit } from '../../../../core/middleware/audit.middleware'
import { getParam } from '../../../../core/utils/request.utils'

const router = Router()

router.use(requireAuth)
router.use(attachPermissions)

router.get(
  '/:contractMovementId/compensation',
  requirePermission('employee.view'),
  CompensationController.findByContractMovementId,
)

router.post(
  '/:contractMovementId/compensation',
  requirePermission('employee.update'),
  audit('COMPENSATION_CREATE', {
    resource: 'COMPENSATION',
    getResourceId: (req) => getParam(req.params.contractMovementId),
  }),
  CompensationController.createForContractMovement,
)

router.post(
  '/',
  requirePermission('employee.update'),
  audit('CONTRACT_MOVEMENT_CREATE', {
    resource: 'CONTRACT_MOVEMENT',
  }),
  ContractMovementController.create,
)

router.get(
  '/:id',
  requirePermission('employee.view'),
  ContractMovementController.findById,
)

router.patch(
  '/:id',
  requirePermission('employee.update'),
  audit('CONTRACT_MOVEMENT_UPDATE', {
    resource: 'CONTRACT_MOVEMENT',
    getResourceId: (req) => getParam(req.params.id),
  }),
  ContractMovementController.update,
)

router.delete(
  '/:id',
  requirePermission('employee.update'),
  audit('CONTRACT_MOVEMENT_DELETE', {
    resource: 'CONTRACT_MOVEMENT',
    getResourceId: (req) => getParam(req.params.id),
  }),
  ContractMovementController.softDelete,
)

export default router
