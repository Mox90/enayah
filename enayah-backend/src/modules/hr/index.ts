import { Router } from 'express'
import { jobGradeRoutes } from './job-grade'
import { positionRoutes } from './positions'
import { employeeRoutes } from './employees'
import { employmentRoutes } from './employments'
import { positionItemRoutes } from './position-items'

const router = Router()

router.use('/positions', positionRoutes.routes)
router.use('/job-grades', jobGradeRoutes.routes)
router.use('/employees', employeeRoutes.routes)
router.use('/employments', employmentRoutes.routes)
router.use('/position-items', positionItemRoutes.routes)

export const hrModule = {
  routes: router,
}
