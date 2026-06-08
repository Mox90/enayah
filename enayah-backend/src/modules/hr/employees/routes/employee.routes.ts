import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'
import { EmployeeController } from '../controller/employee.controller'
import { getParam } from '../../../../core/utils/request.utils'
import { EmploymentController } from '../../employments/controller/employment.controller'

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

router.get(
  '/:id/profile',
  requirePermission('employee.view'),
  EmployeeController.getProfile,
)

// router.get(
//   '/employee-directory',
//   requirePermission('employee.view'),
//   EmployeeController.findEmployeeDirectory,
// )

router.get(
  '/',
  requirePermission('employee.view'),
  EmployeeController.getEmployees,
)

router.get(
  '/directory',
  requirePermission('employee.view'),
  EmployeeController.findEmployeeDirectory,
)

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

router.get(
  '/find-all',
  requirePermission('employee.view'),
  EmployeeController.findAll,
)

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
    sanitize: {
      redactFields: ['email', 'phone'],
    },
  }),
  EmployeeController.update,
)

router.delete(
  '/:id',
  requirePermission('employee.delete'),
  audit('DELETE_EMPLOYEE', {
    resource: 'EMPLOYEE',
    getResourceId: (req) => getParam(req.params.id),
    sanitize: {
      redactFields: ['email', 'phone'],
    },
  }),
  EmployeeController.delete,
)

export default router
