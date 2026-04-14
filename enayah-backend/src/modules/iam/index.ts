import e, { Router } from 'express'
import { AccessControlModule } from './access-control'
import { authModule } from './auth'
import { auditModule } from './audit'

const router = Router()

router.use('/auth', authModule.routes)
router.use('/', AccessControlModule.routes)
router.use('/audit', auditModule.routes)

export const iamModule = {
  routes: router,
}
