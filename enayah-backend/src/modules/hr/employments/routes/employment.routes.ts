// employment.routes.ts
import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { requirePermission } from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'
import { EmploymentController } from '../controller/employment.controller'

const router = Router()

router.use(requireAuth)

router.get(
  '/',
  requirePermission('employment.view'),
  EmploymentController.findAll,
)
router.post(
  '/',
  requirePermission('employment.create'),
  audit('HIRE_EMPLOYEE', 'EMPLOYMENT'),
  EmploymentController.hire,
)
router.post(
  '/:id/terminate',
  requirePermission('employment.terminate'),
  audit('TERMINATE_EMPLOYMENT', 'EMPLOYMENT'),
  EmploymentController.terminate,
)

router.delete(
  '/:id',
  requirePermission('employment.delete'),
  audit('DELETE_EMPLOYMENT', 'EMPLOYMENT'),
  EmploymentController.delete,
)

export default router
