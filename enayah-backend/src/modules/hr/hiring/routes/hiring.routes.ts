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
  audit('EMPLOYMENT_HIRING', 'EMPLOYMENT', (req) =>
    typeof req.params.id === 'string' ? req.params.id : undefined,
  ),
  HiringController.hire,
)

export default router
