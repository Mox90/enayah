import { Router } from 'express'
import { UserRoleController } from '../controller/userRole.controller'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { requirePermission } from '../../../../core/middleware/permission.middleware'
import { validate } from '../../../../core/middleware/validate.middleware'
import {
  assignRoleSchema,
  userParamsSchema,
  userRoleParamsSchema,
} from '../dto/userRole.request'

const router = Router()

router.use(requireAuth)

/*
router.post(
  '/assign',
  requirePermission('role.assign'),
  UserRoleController.assignRoleToUser,
)*/

router.use(requireAuth)

// ✅ Assign role to user
router.post(
  '/users/:userId/roles',
  requirePermission('role.assign'),
  validate({ params: userParamsSchema, body: assignRoleSchema }),
  UserRoleController.assignRoleToUser,
)

// ✅ Get user roles
router.get(
  '/users/:userId/roles',
  requirePermission('role.view'),
  validate({ params: userParamsSchema }),
  UserRoleController.getUserRoles,
)

// ✅ Remove role from user
router.delete(
  '/users/:userId/roles/:roleId',
  requirePermission('role.remove'),
  validate({ params: userRoleParamsSchema }),
  UserRoleController.removeRoleFromUser,
)

/*
router.get('/test', (req, res) => {
  res.json({ message: 'User Role route is working!' })
})*/

export default router
