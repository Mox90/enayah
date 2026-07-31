// src/modules/hr/credentials/routes/credential.routes.ts

import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { CredentialController } from '../controller/credential.controller'
import { requireEmployeeAccess } from '../../../../core/middleware/employee-access.middleware'

const router = Router()

router.use(requireAuth)
router.use(attachPermissions)

router.get(
  '/employee/:employeeId',
  //requirePermission('employee.credentials.view'),
  requireEmployeeAccess({
    employeeIdParam: 'id',
    anyEmployeePermission: 'employee.credentials.view',
    selfPermission: 'employee.self.view',
  }),
  CredentialController.findByEmployeeId,
)

// -----------------------------------------------
// ALL CREATE
// -----------------------------------------------

router.post(
  '/employee/:employeeId',
  requirePermission('employee.credentials.update'),
  CredentialController.createAll,
)

router.post(
  '/employee/:employeeId/degrees',
  requirePermission('employee.credentials.update'),
  CredentialController.createDegree,
)

router.post(
  '/employee/:employeeId/boards',
  requirePermission('employee.credentials.update'),
  CredentialController.createBoard,
)

router.post(
  '/employee/:employeeId/fellowships',
  requirePermission('employee.credentials.update'),
  CredentialController.createFellowship,
)

router.post(
  '/employee/:employeeId/memberships',
  requirePermission('employee.credentials.update'),
  CredentialController.createMembership,
)

router.post(
  '/employee/:employeeId/licenses',
  requirePermission('employee.credentials.update'),
  CredentialController.createLicense,
)

router.post(
  '/employee/:employeeId/life-support',
  requirePermission('employee.credentials.update'),
  CredentialController.createLifeSupport,
)

router.post(
  '/employee/:employeeId/malpractice',
  requirePermission('employee.credentials.update'),
  CredentialController.createMalpractice,
)

// -----------------------------------------------
// ALL EDIT/UPDATE
// -----------------------------------------------

router.patch(
  '/degrees/:id',
  requirePermission('employee.credentials.update'),
  CredentialController.updateDegree,
)

router.patch(
  '/boards/:id',
  requirePermission('employee.credentials.update'),
  CredentialController.updateBoard,
)

router.patch(
  '/fellowships/:id',
  requirePermission('employee.credentials.update'),
  CredentialController.updateFellowship,
)

router.patch(
  '/memberships/:id',
  requirePermission('employee.credentials.update'),
  CredentialController.updateMembership,
)

router.patch(
  '/licenses/:id',
  requirePermission('employee.credentials.update'),
  CredentialController.updateLicense,
)

router.patch(
  '/life-support/:id',
  requirePermission('employee.credentials.update'),
  CredentialController.updateLifeSupport,
)

router.patch(
  '/malpractice/:id',
  requirePermission('employee.credentials.update'),
  CredentialController.updateMalpractice,
)

// -----------------------------------------------
// ALL DELETE
// -----------------------------------------------

router.delete(
  '/degrees/:id',
  requirePermission('employee.credentials.update'),
  CredentialController.deleteDegree,
)

router.delete(
  '/boards/:id',
  requirePermission('employee.credentials.update'),
  CredentialController.deleteBoard,
)

router.delete(
  '/fellowships/:id',
  requirePermission('employee.credentials.update'),
  CredentialController.deleteFellowship,
)

router.delete(
  '/memberships/:id',
  requirePermission('employee.credentials.update'),
  CredentialController.deleteMembership,
)

router.delete(
  '/licenses/:id',
  requirePermission('employee.credentials.update'),
  CredentialController.deleteLicense,
)

router.delete(
  '/life-support/:id',
  requirePermission('employee.credentials.update'),
  CredentialController.deleteLifeSupport,
)

router.delete(
  '/malpractice/:id',
  requirePermission('employee.credentials.update'),
  CredentialController.deleteMalpractice,
)

export default router
