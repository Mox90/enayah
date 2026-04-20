import { Router } from 'express'
import { AuthController } from '../controller/auth.controller'
import {
  rateLimitLogin,
  requireAuth,
} from '../../../../core/middleware/auth.middleware'

const router = Router()

//router.post('/signup', rateLimitLogin, AuthController.signup)
router.post('/signup', AuthController.signup)
router.post('/login', rateLimitLogin, AuthController.login)

router.post('/mfa/verify', AuthController.verifyMfa)

router.post('/refresh', AuthController.refresh)
router.post('/logout', requireAuth, AuthController.logout)
router.post('/logout-all', requireAuth, AuthController.logoutAll)

export default router
