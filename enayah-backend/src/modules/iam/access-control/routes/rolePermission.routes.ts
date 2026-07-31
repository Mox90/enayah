import { Router } from 'express'

import { RolePermissionController } from '../controller/rolePermission.controller'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { requirePermission } from '../../../../core/middleware/permission.middleware'
import { validate } from '../../../../core/middleware/validate.middleware'
import {
  assignPermissionSchema,
  roleParamsSchema,
  rolePermissionParamsSchema,
} from '../dto/rolePermission.request'
import { audit } from '../../../../core/middleware/audit.middleware'

const router = Router()

router.use(requireAuth)

// Assign permission to role
router.post(
  '/roles/:roleId/permissions',
  requirePermission('permission.assign'),
  validate({
    params: roleParamsSchema,
    body: assignPermissionSchema,
  }),
  audit('ASSIGN_PERMISSION_TO_ROLE', {
    resource: 'ROLE_PERMISSION',

    getResourceId: (req) => {
      const roleId = req.params.roleId
      const permissionId = req.body.permissionId

      return typeof roleId === 'string' && typeof permissionId === 'string'
        ? `${roleId}:${permissionId}`
        : undefined
    },

    sanitize: {
      allowList: ['permissionId'],
    },
  }),
  RolePermissionController.assign,
)

// Get permissions assigned to a role
router.get(
  '/roles/:roleId/permissions',
  requirePermission('permission.view'),
  validate({
    params: roleParamsSchema,
  }),
  audit('VIEW_ROLE_PERMISSIONS', {
    resource: 'ROLE_PERMISSION',

    getResourceId: (req) => {
      const roleId = req.params.roleId

      return typeof roleId === 'string' ? roleId : undefined
    },
  }),
  RolePermissionController.getRolePermissions,
)

// Remove permission from role
router.delete(
  '/roles/:roleId/permissions/:permissionId',
  requirePermission('permission.remove'),
  validate({
    params: rolePermissionParamsSchema,
  }),
  audit('REMOVE_PERMISSION_FROM_ROLE', {
    resource: 'ROLE_PERMISSION',

    getResourceId: (req) => {
      const roleId = req.params.roleId
      const permissionId = req.params.permissionId

      return typeof roleId === 'string' && typeof permissionId === 'string'
        ? `${roleId}:${permissionId}`
        : undefined
    },
  }),
  RolePermissionController.remove,
)

export default router
