import { Router } from 'express'
import { DepartmentController } from '../controller/department.controller'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { requireRole } from '../../../../core/security/rbac'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'
import { getParam } from '../../../../core/utils/request.utils'

const router = Router()

router.use(requireAuth) // Apply authentication middleware to all routes in this router
router.use(attachPermissions)

router.get('/tree', DepartmentController.findTree) // Static route must always come before dynamic routes

//router.post('/', requireRole('HR_ADMIN'), DepartmentController.create)
router.post(
  '/',
  requirePermission('department.create'),
  audit('CREATE_DEPARTMENT', {
    resource: 'DEPARTMENT',
  }),
  DepartmentController.create,
)

router.get('/', DepartmentController.findAll)

router.get('/:id', DepartmentController.findById)

//router.put('/:id', requirePermission('department.update'), DepartmentController.update)
router.put(
  '/:id',
  requirePermission('department.update'),
  audit('UPDATE_DEPARTMENT', {
    resource: 'DEPARTMENT',
    getResourceId: (req) => getParam(req.params.id),
  }),
  DepartmentController.update,
)

//router.delete('/:id', requireRole('HR_ADMIN'), DepartmentController.delete)
router.delete(
  '/:id',
  requirePermission('department.delete'),
  audit('DELETE_DEPARTMENT', {
    resource: 'DEPARTMENT',
    getResourceId: (req) => getParam(req.params.id),
  }),
  DepartmentController.delete,
)

export default router
