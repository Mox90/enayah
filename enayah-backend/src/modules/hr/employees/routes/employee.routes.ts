import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { requirePermission } from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'
import { EmployeeController } from '../controller/employee.controller'

const router = Router()

router.use(requireAuth)

router.post(
  '/',
  requirePermission('employee.create'),
  audit('CREATE_EMPLOYEE', 'EMPLOYEE', (req) =>
    typeof req.params.id === 'string' ? req.params.id : undefined,
  ),
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
  audit('EMPLOYEE_UPDATE', 'EMPLOYEE', (req) =>
    typeof req.params.id === 'string' ? req.params.id : undefined,
  ),
  EmployeeController.update,
)

export default router
