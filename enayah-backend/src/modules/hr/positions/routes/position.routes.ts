import { Router } from 'express'
import { PositionController } from '../controller/position.controller'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { requireRole } from '../../../../core/security/rbac'
import { attachPermissions } from '../../../../core/middleware/permission.middleware'

const router = Router()

router.use(requireAuth) // Apply authentication middleware to all routes in this router
router.use(attachPermissions)

router.get('/lookup', PositionController.findLookup)
router.post('/', requireRole('HR_ADMIN'), PositionController.create)
router.get('/', PositionController.findPaginated)
router.get('/:id', PositionController.findById)
router.put('/:id', requireRole('HR_ADMIN'), PositionController.update)
router.delete('/:id', requireRole('HR_ADMIN'), PositionController.delete)

export default router
