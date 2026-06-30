import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'
import { getParam } from '../../../../core/utils/request.utils'
import { EmployeePersonalController } from '../controller/employee-personal.controller'

const router = Router()

router.use(requireAuth)
router.use(attachPermissions)

// --------------------------------------------------
// Full Personal Details
// --------------------------------------------------

router.get(
  '/:id/personal',
  requirePermission('employee.view'),
  EmployeePersonalController.findByEmployeeId,
)

router.post(
  '/personal/:id',
  requirePermission('employee.update'),
  audit('EMPLOYEE_PERSONAL_CREATE', {
    resource: 'EMPLOYEE',
    getResourceId: (req) => getParam(req.params.id),
    sanitize: {
      //redactFields: ['email', 'phoneNumber', 'mobile', 'identificationNumber'],
      redactFields: [
        'email',
        'phoneNumber',
        'mobile',
        'alternateMobile',
        'identificationNumber',
        'visaNumber',
        'firstNameEn',
        'secondNameEn',
        'thirdNameEn',
        'familyNameEn',
        'firstNameAr',
        'secondNameAr',
        'thirdNameAr',
        'familyNameAr',
        'dateOfBirth',
        'address',
        'street',
        'building',
        'postalCode',
        'additionalNumber',
      ],
    },
  }),
  EmployeePersonalController.createAll,
)

// --------------------------------------------------
// Update Specific Records
// --------------------------------------------------

router.patch(
  '/personal/identifications/:id',
  requirePermission('employee.update'),
  EmployeePersonalController.updateIdentification,
)

router.patch(
  '/personal/emails/:id',
  requirePermission('employee.update'),
  EmployeePersonalController.updateEmail,
)

router.patch(
  '/personal/phone-numbers/:id',
  requirePermission('employee.update'),
  EmployeePersonalController.updatePhoneNumber,
)

router.patch(
  '/personal/dependents/:id',
  requirePermission('employee.update'),
  EmployeePersonalController.updateDependent,
)

router.patch(
  '/personal/addresses/:id',
  requirePermission('employee.update'),
  EmployeePersonalController.updateAddress,
)

router.patch(
  '/personal/emergency-contacts/:id',
  requirePermission('employee.update'),
  EmployeePersonalController.updateEmergencyContact,
)

router.patch(
  '/personal/visas/:id',
  requirePermission('employee.update'),
  EmployeePersonalController.updateVisa,
)

// --------------------------------------------------
// Soft Delete Specific Records
// --------------------------------------------------

router.delete(
  '/personal/identifications/:id',
  requirePermission('employee.update'),
  EmployeePersonalController.softDeleteIdentification,
)

router.delete(
  '/personal/emails/:id',
  requirePermission('employee.update'),
  EmployeePersonalController.softDeleteEmail,
)

router.delete(
  '/personal/phone-numbers/:id',
  requirePermission('employee.update'),
  EmployeePersonalController.softDeletePhoneNumber,
)

router.delete(
  '/personal/dependents/:id',
  requirePermission('employee.update'),
  EmployeePersonalController.softDeleteDependent,
)

router.delete(
  '/personal/addresses/:id',
  requirePermission('employee.update'),
  EmployeePersonalController.softDeleteAddress,
)

router.delete(
  '/personal/emergency-contacts/:id',
  requirePermission('employee.update'),
  EmployeePersonalController.softDeleteEmergencyContact,
)

router.delete(
  '/personal/visas/:id',
  requirePermission('employee.update'),
  EmployeePersonalController.softDeleteVisa,
)

export default router
