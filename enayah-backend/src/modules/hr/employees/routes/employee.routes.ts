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

router.get(
  '/:employeeId/employments',
  requirePermission('employee.view'),
  EmploymentController.findByEmployeeId,
)

router.get(
  '/:employeeId/employments/active',
  requirePermission('employee.view'),
  EmploymentController.findActiveByEmployee,
)

router.post(
  '/:employeeId/employments',
  requirePermission('employee.update'),
  audit('EMPLOYMENT_CREATE', {
    resource: 'EMPLOYMENT',
    getResourceId: (req) => getParam(req.params.employeeId),
  }),

  EmploymentController.createForEmployee,
)

router.get(
  '/:id/profile',
  requirePermission('employee.view'),
  EmployeeController.getProfile,
)

router.get(
  '/',
  requirePermission('employee.view'),
  EmployeeController.findEmployeeDirectory,
)

router.post(
  '/',
  requirePermission('employee.create'),
  audit('EMPLOYEE_CREATE', {
    resource: 'EMPLOYEE',
    sanitize: {
      redactFields: ['email', 'phone'],
    },
  }),
  EmployeeController.create,
)

router.get(
  '/:id/profile',
  requirePermission('employee.view'),
  EmployeeController.getProfile,
)

router.get(
  '/:id',
  requirePermission('employee.view'),
  EmployeeController.findById,
)

// router.patch(
//   '/:id/personal',
//   requirePermission('employee.update'),
//   audit('EMPLOYEE_UPDATE', {
//     resource: 'EMPLOYEE',
//     getResourceId: (req) => getParam(req.params.id),
//     // sanitize: {
//     //   redactFields: ['email', 'phone'],
//     // },
//   }),
//   EmployeeController.update,
// )

router.patch(
  '/:id',
  requirePermission('employee.update'),
  audit('EMPLOYEE_UPDATE', {
    resource: 'EMPLOYEE',
    getResourceId: (req) => getParam(req.params.id),
    // sanitize: {
    //   redactFields: ['email', 'phone'],
    // },
  }),
  EmployeeController.update,
)

router.delete(
  '/:id',
  requirePermission('employee.delete'),
  audit('EMPLOYEE_DELETE', {
    resource: 'EMPLOYEE',
    getResourceId: (req) => getParam(req.params.id),
    sanitize: {
      redactFields: ['email', 'phone'],
    },
  }),
  EmployeeController.delete,
)

export default router
