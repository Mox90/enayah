import { Router } from 'express'
import { JobAssignmentController } from '../controller/jobAssignment.controller'
import { audit } from '../../../../core/middleware/audit.middleware'
import { requirePermission } from '../../../../core/middleware/permission.middleware'

const router = Router()

// 🔹 CREATE ASSIGNMENT (nested under employment)
router.post(
  '/employments/:employmentId/job-assignments',
  requirePermission('jobAssignment.create'),
  audit('CREATE_JOB_ASSIGNMENT', 'JOB_ASSIGNMENT'),
  JobAssignmentController.create,
)

// 🔹 GET PRIMARY ASSIGNMENT
router.get(
  '/employments/:employmentId/job-assignments/primary',
  requirePermission('jobAssignment.view'),
  JobAssignmentController.getPrimary,
)

// 🔹 UPDATE ASSIGNMENT
router.patch(
  '/job-assignments/:id',
  requirePermission('jobAssignment.update'),
  audit('UPDATE_JOB_ASSIGNMENT', 'JOB_ASSIGNMENT'),
  JobAssignmentController.update,
)

// 🔹 END ASSIGNMENT (soft close)
router.patch(
  '/job-assignments/:id/end',
  requirePermission('jobAssignment.update'),
  audit('END_JOB_ASSIGNMENT', 'JOB_ASSIGNMENT'),
  JobAssignmentController.endAssignment,
)

router.delete(
  '/:id',
  requirePermission('jobAssignment.delete'),
  audit('DELETE_JOB_ASSIGNMENT', 'JOB_ASSIGNMENT'),
  JobAssignmentController.delete,
)

export default router
