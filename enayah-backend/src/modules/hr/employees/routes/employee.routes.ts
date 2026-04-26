import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'
import { EmployeeController } from '../controller/employee.controller'
import { getParam } from '../../../../core/utils/request.utils'

const router = Router()

router.use(requireAuth)
router.use(attachPermissions)

/*

audit('CREATE_EMPLOYEE', {
  resource: 'EMPLOYEE',
  sanitize: {
    redactFields: ['email', 'phone'],
  },
})

*/

router.post(
  '/',
  requirePermission('employee.create'),
  audit('CREATE_EMPLOYEE', {
    resource: 'EMPLOYEE',
    sanitize: {
      redactFields: ['email', 'phone'],
    },
  }),
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
  audit('EMPLOYEE_UPDATE', {
    resource: 'EMPLOYEE',
    getResourceId: (req) => getParam(req.params.id),
  }),
  EmployeeController.update,
)

router.delete(
  '/:id',
  requirePermission('employee.delete'),
  audit('DELETE_EMPLOYEE', {
    resource: 'EMPLOYEE',
    getResourceId: (req) => getParam(req.params.id),
  }),
  EmployeeController.delete,
)

export default router
