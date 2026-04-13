import { Router } from 'express'
import { AuthController } from '../controller/auth.controller'
import { rateLimitLogin } from '../../../../core/middleware/auth.middleware'

const router = Router()

router.post('/signup', AuthController.signup)
router.post('/login', rateLimitLogin, AuthController.login)

export default router
