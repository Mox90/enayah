import { Router } from 'express'
import { jobGradeRoutes } from './job-grade'
import { positionRoutes } from './positions'
import { employeeRoutes, employeePersonalRoutes } from './employees'
import { employmentRoutes } from './employments'
import { positionItemRoutes } from './position-items'
import { hrAnalyticsRoutes } from './analytics'
//import { hiringRoutes } from './hiring'
import { credentialRoutes } from './credentials'
import { onboardingRoutes } from './onboarding'
import { contractRoutes } from './contracts'
import { contractMovementRoutes } from './contract-movements'
import { appointmentRoutes } from './appointments'

const router = Router()

router.use('/positions', positionRoutes.routes)
router.use('/job-grades', jobGradeRoutes.routes)
router.use('/employees', employeeRoutes)
router.use('/employees', employeePersonalRoutes)
router.use('/employments', employmentRoutes.routes)
router.use('/position-items', positionItemRoutes.routes)
router.use('/analytics', hrAnalyticsRoutes.routes)
router.use('/onboarding', onboardingRoutes.routes)
router.use('/credentials', credentialRoutes.routes)
router.use('/contracts', contractRoutes)
router.use('/contract-movements', contractMovementRoutes)
router.use('/appointments', appointmentRoutes)

export const hrModule = {
  routes: router,
}
