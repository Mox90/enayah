import { Router } from 'express'
import { DepartmentController } from '../controller/department.controller'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { requireRole } from '../../../../core/security/rbac'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'

const router = Router()

router.use(requireAuth) // Apply authentication middleware to all routes in this router
router.use(attachPermissions)

router.get('/tree', DepartmentController.findTree) // Static route must always come before dynamic routes

//router.post('/', requireRole('HR_ADMIN'), DepartmentController.create)
router.post(
  '/',
  requirePermission('department.create'),
  audit('ADD_DEPARTMENT', 'DEPARTMENT'),
  DepartmentController.create,
)

router.get('/', DepartmentController.findAll)

router.get('/:id', DepartmentController.findById)

//router.put('/:id', requirePermission('department.update'), DepartmentController.update)
router.put(
  '/:id',
  requirePermission('department.update'),
  audit('DELETE_DEPARTMENT', 'DEPARTMENT', (req) =>
    typeof req.params.id === 'string' ? req.params.id : undefined,
  ),
  DepartmentController.update,
)

//router.delete('/:id', requireRole('HR_ADMIN'), DepartmentController.delete)
router.delete(
  '/:id',
  requirePermission('department.delete'),
  audit('DELETE_DEPARTMENT', 'DEPARTMENT', (req) =>
    typeof req.params.roleId === 'string'
      ? `${req.params.roleId}:${req.params.permissionId}`
      : undefined,
  ),
  DepartmentController.delete,
)

export default router
