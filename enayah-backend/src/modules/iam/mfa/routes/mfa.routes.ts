import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { MFAController } from '../controller/mfa.controller'

const router = Router()

router.use(requireAuth)

router.post('/setup', MFAController.setup)
router.post('/enable', MFAController.enable)
router.post('/disable', MFAController.disable)

export default router
