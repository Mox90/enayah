import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'
import { EmployeeController } from '../controller/employee.controller'

const router = Router()

router.use(requireAuth)
router.use(attachPermissions)

router.post(
  '/',
  requirePermission('employee.create'),
  audit('CREATE_EMPLOYEE', 'EMPLOYEE'),
  EmployeeController.create,
)

router.get('/', requirePermission('employee.view'), EmployeeController.findAll)

router.get(
  '/:id',
  requirePermission('employee.view'),
  EmployeeController.findById,
)

router.put(
  '/:id',
  requirePermission('employee.update'),
  audit('EMPLOYEE_UPDATE', 'EMPLOYEE'),
  EmployeeController.update,
)

router.delete(
  '/:id',
  requirePermission('employee.delete'),
  audit('DELETE_EMPLOYEE', 'EMPLOYEE'),
  EmployeeController.delete,
)

export default router
