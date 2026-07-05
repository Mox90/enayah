import { Router } from 'express'
import { ContractController } from '../controller/contract.controller'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'
import { getParam } from '../../../../core/utils/request.utils'

const router = Router()

router.use(requireAuth)
router.use(attachPermissions)

router.post(
  '/',
  requirePermission('contract.create'),
  audit('CREATE_CONTRACT', {
    resource: 'CONTRACT',
    sanitize: {
      allowList: ['id', 'employmentId', 'contractType', 'startDate', 'endDate'],
    },
  }),
  ContractController.create,
)

router.post(
  '/renew',
  requirePermission('contract.renew'),
  audit('RENEW_CONTRACT', {
    resource: 'CONTRACT',
    sanitize: {
      allowList: ['id', 'employmentId', 'contractType', 'startDate', 'endDate'],
    },
  }),
  ContractController.renew,
)

router.get(
  '/:id/renewal-defaults',
  requirePermission('contract.view'),
  ContractController.getRenewalDefaults,
)

router.get(
  '/:id',
  requirePermission('employee.view'),
  ContractController.findById,
)

router.patch(
  '/:id',
  requirePermission('employee.update'),
  ContractController.update,
)

router.patch(
  '/:id/cancel',
  requirePermission('employee.update'),
  ContractController.cancel,
)

router.patch(
  '/:id/expire',
  requirePermission('employee.update'),
  ContractController.expire,
)

router.delete(
  '/:id',
  requirePermission('contract.delete'),
  audit('DELETE_CONTRACT', {
    resource: 'CONTRACT',
    getResourceId: (req) => getParam(req.params.id),
  }),
  ContractController.softDelete,
)

export default router
