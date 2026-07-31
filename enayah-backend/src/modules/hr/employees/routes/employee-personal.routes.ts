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
  '/:employeeId/personal/dependents/:recordId',
  //requirePermission('employee.update'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.updateDependent,
)

// --------------------------------------------------
// Soft Delete Specific Records
// --------------------------------------------------

router.delete(
  '/:employeeId/personal/identifications/:recordId',
  //requirePermission('employee.update'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.softDeleteIdentification,
)

router.delete(
  '/:employeeId/personal/emails/:recordId',
  //requirePermission('employee.update'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.softDeleteEmail,
)

router.delete(
  '/:employeeId/personal/phone-numbers/:recordId',
  //requirePermission('employee.update'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.softDeletePhoneNumber,
)

router.delete(
  '/:employeeId/personal/dependents/:recordId',
  //requirePermission('employee.update'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.softDeleteDependent,
)

router.delete(
  '/:employeeId/personal/addresses/:recordId',
  //requirePermission('employee.update'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.softDeleteAddress,
)

router.delete(
  '/:employeeId/personal/emergency-contacts/:recordId',
  //requirePermission('employee.update'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.softDeleteEmergencyContact,
)

router.delete(
  '/:employeeId/personal/visas/:recordId',
  //requirePermission('employee.update'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.update',
    selfPermission: 'employee.self.personal.update',
  }),
  EmployeePersonalController.softDeleteVisa,
)

export default router
