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
/*router.post(
  '/roles/:roleId/permissions',
  requirePermission('permission.assign'),
  validate({
    params: roleParamsSchema,
    body: assignPermissionSchema,
  }),
  RolePermissionController.assign,
)*/
router.post(
  '/roles/:roleId/permissions',
  requirePermission('permission.assign'),
  validate({ params: roleParamsSchema, body: assignPermissionSchema }),
  RolePermissionController.assign,
)

// ✅ Get permissions of role
router.get(
  '/roles/:roleId/permissions',
  requirePermission('permission.view'),
  validate({ params: roleParamsSchema }),
  RolePermissionController.getRolePermissions,
)

// ✅ Remove permission
router.delete(
  '/roles/:roleId/permissions/:permissionId',
  requirePermission('permission.remove'),
  validate({ params: rolePermissionParamsSchema }),
  RolePermissionController.remove,
)

/*
router.get('/test', (req, res) => {
  res.json({ message: 'Role-Permission route is working!' })
})*/

export default router
