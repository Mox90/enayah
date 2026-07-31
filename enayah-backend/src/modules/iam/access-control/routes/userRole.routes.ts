import { Router } from 'express'

import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'
import { requirePermission } from '../../../../core/middleware/permission.middleware'
import { validate } from '../../../../core/middleware/validate.middleware'

import { UserRoleController } from '../controller/userRole.controller'
import {
  assignRoleSchema,
  userParamsSchema,
  userRoleParamsSchema,
} from '../dto/userRole.request'

const router = Router()

router.use(requireAuth)

// Assign role to user
router.post(
  '/users/:userId/roles',
  requirePermission('role.assign'),
  validate({
    params: userParamsSchema,
    body: assignRoleSchema,
  }),
  audit('ASSIGN_ROLE_TO_USER', {
    resource: 'USER_ROLE',

    getResourceId: (req) => {
      const userId = req.params.userId
      const roleId = req.body.roleId

      return typeof userId === 'string' && typeof roleId === 'string'
        ? `${userId}:${roleId}`
        : undefined
    },

    sanitize: {
      allowList: ['roleId'],
    },
  }),
  UserRoleController.assignRoleToUser,
)

// Get roles assigned to user
router.get(
  '/users/:userId/roles',
  requirePermission('role.view'),
  validate({
    params: userParamsSchema,
  }),
  audit('VIEW_USER_ROLES', {
    resource: 'USER_ROLE',

    getResourceId: (req) => {
      const userId = req.params.userId

      return typeof userId === 'string' ? userId : undefined
    },
  }),
  UserRoleController.getUserRoles,
)

// Remove role from user
router.delete(
  '/users/:userId/roles/:roleId',
  requirePermission('role.remove'),
  validate({
    params: userRoleParamsSchema,
  }),
  audit('REMOVE_ROLE_FROM_USER', {
    resource: 'USER_ROLE',

    getResourceId: (req) => {
      const userId = req.params.userId
      const roleId = req.params.roleId

      return typeof userId === 'string' && typeof roleId === 'string'
        ? `${userId}:${roleId}`
        : undefined
    },
  }),
  UserRoleController.removeRoleFromUser,
)

export default router
