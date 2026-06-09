import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { CredentialController } from '../controller/credential.controller'

const router = Router()

router.use(requireAuth)
router.use(attachPermissions)

router.get(
  '/employee/:id',
  requirePermission('employee.credentials.view'),
  CredentialController.getEmployeeCredentials,
)

export default router
