import { Router } from 'express'
import { JobAssignmentController } from '../controller/jobAssignment.controller'

const router = Router()

// 🔹 CREATE ASSIGNMENT (nested under employment)
router.post(
  '/employments/:employmentId/job-assignments',
  JobAssignmentController.create,
)

// 🔹 GET PRIMARY ASSIGNMENT
router.get(
  '/employments/:employmentId/job-assignments/primary',
  JobAssignmentController.getPrimary,
)

// 🔹 UPDATE ASSIGNMENT
router.patch('/job-assignments/:id', JobAssignmentController.update)

// 🔹 END ASSIGNMENT (soft close)
router.patch('/job-assignments/:id/end', JobAssignmentController.endAssignment)

export default router
