import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'
import { getParam } from '../../../../core/utils/request.utils'
import { EmployeePersonalController } from '../controller/employee-personal.controller'
import { requireEmployeeAccess } from '../../../../core/middleware/employee-access.middleware'

const router = Router()

router.use(requireAuth)
router.use(attachPermissions)

// --------------------------------------------------
// Full Personal Details
// --------------------------------------------------

router.get(
  '/:id/personal',
  //requirePermission('employee.view'),
  requireEmployeeAccess({
    employeeIdParam: 'id',
    anyEmployeePermission: 'employee.view',
    selfPermission: 'employee.self.view',
  }),
  EmployeePersonalController.findByEmployeeId,
)

router.get(
  '/:id/profile-summary',
  //requireAuth,
  //attachPermissions,
  //requirePermission('employee.view'),
  requireEmployeeAccess({
    employeeIdParam: 'id',
    anyEmployeePermission: 'employee.view',
    selfPermission: 'employee.self.view',
  }),
  EmployeePersonalController.getEmployeeProfileSummary,
)

router.post(
  '/personal/:id',
  //requirePermission('employee.update'),
  requireEmployeeAccess({
    employeeIdParam: 'id',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
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
  '/:employeeId/personal/identifications/:recordId',
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.updateIdentification,
)

router.patch(
  '/:employeeId/personal/emails/:recordId',
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.updateEmail,
)

router.patch(
  '/:employeeId/personal/phone-numbers/:recordId',
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.updatePhoneNumber,
)

router.patch(
  '/:employeeId/personal/addresses/:recordId',
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.updateAddress,
)

router.patch(
  '/:employeeId/personal/emergency-contacts/:recordId',
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.updateEmergencyContact,
)

router.patch(
  '/:employeeId/personal/visas/:recordId',
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.updateVisa,
)

router.patch(
  '/personal/dependents/:id',
  //requirePermission('employee.update'),
  requireEmployeeAccess({
    employeeIdParam: 'id',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.updateDependent,
)

// --------------------------------------------------
// Soft Delete Specific Records
// --------------------------------------------------

router.delete(
  '/personal/identifications/:id',
  //requirePermission('employee.update'),
  requireEmployeeAccess({
    employeeIdParam: 'id',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.softDeleteIdentification,
)

router.delete(
  '/personal/emails/:id',
  //requirePermission('employee.update'),
  requireEmployeeAccess({
    employeeIdParam: 'id',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.softDeleteEmail,
)

router.delete(
  '/personal/phone-numbers/:id',
  //requirePermission('employee.update'),
  requireEmployeeAccess({
    employeeIdParam: 'id',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.softDeletePhoneNumber,
)

router.delete(
  '/personal/dependents/:id',
  //requirePermission('employee.update'),
  requireEmployeeAccess({
    employeeIdParam: 'id',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.softDeleteDependent,
)

router.delete(
  '/personal/addresses/:id',
  //requirePermission('employee.update'),
  requireEmployeeAccess({
    employeeIdParam: 'id',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.softDeleteAddress,
)

router.delete(
  '/personal/emergency-contacts/:id',
  //requirePermission('employee.update'),
  requireEmployeeAccess({
    employeeIdParam: 'id',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.softDeleteEmergencyContact,
)

router.delete(
  '/personal/visas/:id',
  //requirePermission('employee.update'),
  requireEmployeeAccess({
    employeeIdParam: 'id',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.softDeleteVisa,
)

export default router
