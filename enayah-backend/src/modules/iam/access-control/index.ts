import userRoleroutes from './routes/userRole.routes'
import rolePermissionroutes from './routes/rolePermission.routes'
import { Router } from 'express'

const router = Router()

router.use('/user-roles', userRoleroutes)
router.use('/role-permissions', rolePermissionroutes)

export const AccessControlModule = {
  routes: router,
}
