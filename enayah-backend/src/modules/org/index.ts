import { Router } from 'express'
import { departmentRoutes } from './departments'

const router = Router()

router.use('/departments', departmentRoutes.routes)

export const orgModule = {
  routes: router,
}
