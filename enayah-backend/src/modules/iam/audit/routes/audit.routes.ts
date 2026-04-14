import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { AuditController } from '../controller/audit.controller'

const router = Router()

router.use(requireAuth)

router.get('/', AuditController.getAll)

export default router
