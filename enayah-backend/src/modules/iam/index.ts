import e, { Router } from 'express'
import { AccessControlModule } from './access-control'
import { authModule } from './auth'
import { auditModule } from './audit'
import { mfaModule } from './mfa'

const router = Router()

router.use('/auth', authModule.routes)
router.use('/', AccessControlModule.routes)
router.use('/audit', auditModule.routes)
router.use('/mfa', mfaModule.routes)

export const iamModule = {
  routes: router,
}
