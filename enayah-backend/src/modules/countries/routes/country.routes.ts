// src/modules/master/countries/routes/country.routes.ts

import { Router } from 'express'
//import { requireAuth } from '../../../../core/middleware/auth.middleware'
//import { attachPermissions } from '../../../../core/middleware/permission.middleware'
import { CountryController } from '../controller/country.controller'
import { requireAuth } from '../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../core/middleware/permission.middleware'

const router = Router()

router.use(requireAuth)
router.use(attachPermissions)

router.get('/', requirePermission('countries.view'), CountryController.lookup)

export default router
