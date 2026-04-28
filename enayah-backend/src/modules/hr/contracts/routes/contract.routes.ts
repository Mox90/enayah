import { Router } from 'express'
import { ContractController } from '../controller/contract.controller'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { requirePermission } from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'
import { getParam } from '../../../../core/utils/request.utils'

const router = Router()

router.use(requireAuth)

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

router.delete(
  '/:id',
  requirePermission('contract.delete'),
  audit('DELETE_CONTRACT', {
    resource: 'CONTRACT',
    getResourceId: (req) => getParam(req.params.id),
  }),
  ContractController.delete,
)

export default router
