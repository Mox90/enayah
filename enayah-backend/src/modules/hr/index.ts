import { Router } from 'express'
import { jobGradeRoutes } from './job-grade'
import { positionRoutes } from './positions'

const router = Router()

router.use('/positions', positionRoutes.routes)
router.use('/job-grades', jobGradeRoutes.routes)

export const hrModule = {
  routes: router,
}
