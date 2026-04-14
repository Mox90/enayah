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
/*
router.post(
  '/assign',
  requireAuth,
  requirePermission('permission.assign'),
  RolePermissionController.assign,
)*/

router.use(requireAuth)

// ✅ Assign permissions
router.post(
  '/roles/:roleId/permissions',
  requirePermission('permission.assign'),
  validate({ params: roleParamsSchema, body: assignPermissionSchema }),
  audit('ASSIGN_PERMISSION_TO_ROLE', 'ROLE_PERMISSION', (req) =>
    typeof req.params.roleId === 'string'
      ? `${req.params.roleId}:${req.params.permissionId}`
      : undefined,
  ),
  RolePermissionController.assign,
)

// ✅ Get permissions of role
router.get(
  '/roles/:roleId/permissions',
  requirePermission('permission.view'),
  validate({ params: roleParamsSchema }),
  audit('ASSIGN_PERMISSION_TO_ROLE', 'ROLE_PERMISSION', (req) =>
    typeof req.params.roleId === 'string'
      ? `${req.params.roleId}:${req.params.permissionId}`
      : undefined,
  ),
  RolePermissionController.getRolePermissions,
)

// ✅ Remove permission
router.delete(
  '/roles/:roleId/permissions/:permissionId',
  requirePermission('permission.remove'),
  validate({ params: rolePermissionParamsSchema }),
  audit('ASSIGN_PERMISSION_TO_ROLE', 'ROLE_PERMISSION', (req) =>
    typeof req.params.roleId === 'string'
      ? `${req.params.roleId}:${req.params.permissionId}`
      : undefined,
  ),
  RolePermissionController.remove,
)

/*
router.get('/test', (req, res) => {
  res.json({ message: 'Role-Permission route is working!' })
})*/

export default router
