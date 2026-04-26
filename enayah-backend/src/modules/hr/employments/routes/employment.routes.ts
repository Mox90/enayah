// employment.routes.ts
import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { requirePermission } from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'
import { EmploymentController } from '../controller/employment.controller'
import { getParam } from '../../../../core/utils/request.utils'

const router = Router()

router.use(requireAuth)

router.get(
  '/',
  requirePermission('employment.view'),
  EmploymentController.findAll,
)
/*

audit('EMPLOYMENT_CREATE', {
  resource: 'EMPLOYMENT',
  sanitize: {
    allowList: ['id', 'employeeId', 'status', 'startDate'],
  },
})

*/
router.post(
  '/',
  requirePermission('employment.create'),
  audit('HIRE_EMPLOYEE', {
    resource: 'EMPLOYMENT',
    sanitize: {
      allowList: ['employeeId', 'status', 'startDate'],
    },
  }),
  EmploymentController.hire,
)
router.post(
  '/:id/terminate',
  requirePermission('employment.terminate'),
  audit('TERMINATE_EMPLOYMENT', {
    resource: 'EMPLOYMENT',
    getResourceId: (req) => getParam(req.params.id),
  }),
  EmploymentController.terminate,
)

router.delete(
  '/:id',
  requirePermission('employment.delete'),
  audit('DELETE_EMPLOYMENT', {
    resource: 'EMPLOYMENT',
    getResourceId: (req) => getParam(req.params.id),
  }),
  EmploymentController.delete,
)

export default router
