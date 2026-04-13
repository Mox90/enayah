import e, { Router } from 'express'
import { AccessControlModule } from './access-control'
import { authModule } from './auth'

const router = Router()

router.use('/auth', authModule.routes)
router.use('/', AccessControlModule.routes)

export const iamModule = {
  routes: router,
}
