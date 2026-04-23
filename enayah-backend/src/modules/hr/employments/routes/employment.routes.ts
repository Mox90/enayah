// employment.routes.ts
import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { requirePermission } from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'
import { EmploymentController } from '../controller/employment.controller'

const router = Router()

router.use(requireAuth)

router.post(
  '/',
  requirePermission('employment.create'),
  audit('HIRE_EMPLOYEE', 'EMPLOYMENT'),
  EmploymentController.hire,
)

router.post(
  '/:id/terminate',
  requirePermission('employment.terminate'),
  audit('TERMINATE_EMPLOYMENT', 'EMPLOYMENT', (req) =>
    typeof req.params.id === 'string' ? req.params.id : undefined,
  ),
  EmploymentController.terminate,
)

export default router
