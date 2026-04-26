import { Router } from 'express'
import { HiringController } from '../controller/hiring.controller'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { requirePermission } from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'

const router = Router()

router.use(requireAuth)

router.post(
  '/',
  requirePermission('employee.hire'),
  audit('HIRE_EMPLOYEE', {
    resource: 'EMPLOYMENT',
    sanitize: {
      allowList: ['id', 'employeeId', 'status', 'startDate'],
    },
  }),
  // ID comes AFTER creation
  // so we rely on controller:
  // res.locals.resourceId = employment.id
  HiringController.hire,
)

export default router
