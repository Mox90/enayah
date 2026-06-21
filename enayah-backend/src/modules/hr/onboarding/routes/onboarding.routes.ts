import { Router } from 'express'
//import { HiringController } from '../controller/onboarding.controller'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'
import { OnboardingController } from '../controller/onboarding.controller'

const router = Router()
router.use(requireAuth)
router.use(attachPermissions)

router.get('/', (req, res) => {
  //console.log('Testing onboarding routes...')
  res.send('Onboarding routes works...')
})

router.post(
  '/',
  requirePermission('employee.onboarding'),
  audit('EMPLOYEE_ONBOARDING_SUBMIT', {
    resource: 'EMPLOYEE',
    sanitize: {
      allowList: ['id', 'employeeId', 'status', 'startDate'],
      redactFields: ['email', 'phoneNumber', 'mobile', 'identificationNumber'],
    },
  }),
  // ID comes AFTER creation
  // so we rely on controller:
  // res.locals.resourceId = employment.id
  OnboardingController.submit,
)

export default router
