import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'
import { getParam } from '../../../../core/utils/request.utils'
import { EmploymentController } from '../controller/employment.controller'
import { requireEmployeeAccess } from '../../../../core/middleware/employee-access.middleware'

const router = Router()

router.use(requireAuth)
router.use(attachPermissions)

router.get(
  '/employee/:employeeId',
  //requirePermission('employee.view'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.view',
    selfPermission: 'employee.self.view',
  }),
  EmploymentController.getEmploymentTimeline,
)

router.get(
  '/',
  requirePermission('employee.view'),
  EmploymentController.findAll,
)

router.post(
  '/',
  requirePermission('employee.update'),
  audit('EMPLOYMENT_CREATE', {
    resource: 'EMPLOYMENT',
  }),
  EmploymentController.create,
)

router.get(
  '/:id',
  requirePermission('employee.view'),
  EmploymentController.findById,
)

router.patch(
  '/:id',
  requirePermission('employee.update'),
  audit('EMPLOYMENT_UPDATE', {
    resource: 'EMPLOYMENT',
    getResourceId: (req) => getParam(req.params.id),
  }),
  EmploymentController.update,
)

// router.patch(
//   '/:id/terminate',
//   requirePermission('employee.update'),
//   audit('EMPLOYMENT_TERMINATE', {
//     resource: 'EMPLOYMENT',
//     getResourceId: (req) => getParam(req.params.id),
//   }),
//   EmploymentController.terminate,
// )

// router.patch(
//   '/:id/end-employment',
//   requirePermission('employee.update'),
//   audit('EMPLOYMENT_END_EMPLOYMENT', {
//     resource: 'EMPLOYMENT',
//     getResourceId: (req) => getParam(req.params.id),
//   }),
//   EmploymentController.endEmployment,
// )

router.delete(
  '/:id',
  requirePermission('employee.update'),
  audit('EMPLOYMENT_DELETE', {
    resource: 'EMPLOYMENT',
    getResourceId: (req) => getParam(req.params.id),
  }),
  EmploymentController.softDelete,
)

export default router
