import { Router } from 'express'
import { JobGradeController } from '../controller/jobGrade.controller'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { requireRole } from '../../../../core/security/rbac'

const router = Router()

router.use(requireAuth) // Apply authentication middleware to all routes in this router

router.post('/', requireRole('HR_ADMIN'), JobGradeController.create)
router.get('/', JobGradeController.findAll)
router.get('/:id', JobGradeController.findById)
router.put('/:id', requireRole('HR_ADMIN'), JobGradeController.update)
router.delete('/:id', requireRole('HR_ADMIN'), JobGradeController.delete)

export default router
