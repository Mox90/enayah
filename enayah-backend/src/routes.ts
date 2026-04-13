import { Router } from 'express'
import { iamModule } from './modules/iam'
import { orgModule } from './modules/org'
import { hrModule } from './modules/hr'

const router = Router()

//router.use('/auth', authRoutes)

//router.use('/auth', authModule.routes)
router.use('/iam', iamModule.routes)
router.use('/org', orgModule.routes)
router.use('/hr', hrModule.routes)
//router.use('/departments', departmentModule.routes)
//router.use('/positions', positionModule.routes)
//router.use('/job-grades', jobGradeModule.routes)
//router.use('/access-control', AccessControlModule.routes)

router.get('/', (_req, res) => {
  res.send('Enayah Backend API')
})

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Enayah backend running',
  })
})

export default router
