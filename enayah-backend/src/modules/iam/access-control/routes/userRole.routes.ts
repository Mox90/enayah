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
import { audit } from '../../../../core/middleware/audit.middleware'

const router = Router()

router.use(requireAuth)

/*
router.post(
  '/assign',
  requirePermission('role.assign'),
  UserRoleController.assignRoleToUser,
)*/

// ✅ Assign role to user
router.post(
  '/users/:userId/roles',
  requirePermission('role.assign'),
  validate({ params: userParamsSchema, body: assignRoleSchema }),
  audit('ASSIGN_ROLE_TO_USER', 'USER_ROLE', (req) =>
    typeof req.params.roleId === 'string'
      ? `${req.params.roleId}:${req.params.permissionId}`
      : undefined,
  ),
  UserRoleController.assignRoleToUser,
)

// ✅ Get user roles
router.get(
  '/users/:userId/roles',
  requirePermission('role.view'),
  validate({ params: userParamsSchema }),
  audit('VIEW_USER_ROLES', 'USER_ROLE', (req) =>
    typeof req.params.roleId === 'string'
      ? `${req.params.roleId}:${req.params.permissionId}`
      : undefined,
  ),
  UserRoleController.getUserRoles,
)

// ✅ Remove role from user
router.delete(
  '/users/:userId/roles/:roleId',
  requirePermission('role.remove'),
  validate({ params: userRoleParamsSchema }),
  audit('REMOVE_ROLE_FROM_USER', 'USER_ROLE', (req) =>
    typeof req.params.roleId === 'string'
      ? `${req.params.roleId}:${req.params.permissionId}`
      : undefined,
  ),
  UserRoleController.removeRoleFromUser,
)

/*
router.get('/test', (req, res) => {
  res.json({ message: 'User Role route is working!' })
})*/

export default router
