// src/modules/hr/credentials/routes/credential.routes.ts

import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { CredentialController } from '../controller/credential.controller'
import { requireEmployeeAccess } from '../../../../core/middleware/employee-access.middleware'
import {
  credentialDocumentUpload,
  uploadCredentialDocumentMiddleware,
} from '../middleware/credential-document-upload.middleware'

const router = Router()

router.use(requireAuth)
router.use(attachPermissions)

router.get(
  '/employee/:employeeId/degrees/:id/document/preview',
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.view',
    selfPermission: 'employee.self.view',
  }),
  CredentialController.previewDegreeDocument,
)

router.get(
  '/employee/:employeeId/degrees/:id/document/download',
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.view',
    selfPermission: 'employee.self.view',
  }),
  CredentialController.downloadDegreeDocument,
)

router.get(
  '/employee/:employeeId/degrees/:id/verification/events/:eventId/evidence/preview',
  //requirePermission('credential.verify'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'credential.verify',
    selfPermission: 'employee.self.view',
  }),
  CredentialController.previewDegreeVerificationEvidence,
)

router.get(
  '/employee/:employeeId/degrees/:id/verification/events/:eventId/evidence/download',
  //requirePermission('credential.verify'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'credential.verify',
    selfPermission: 'employee.self.view',
  }),
  CredentialController.downloadDegreeVerificationEvidence,
)

router.get(
  '/employee/:employeeId',
  //requirePermission('employee.credentials.view'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
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
  //requirePermission('employee.credentials.update'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.credentials.update',
    selfPermission: 'employee.self.update',
  }),
  CredentialController.createAll,
)

// router.post(
//   '/employee/:employeeId/degrees',
//   //requirePermission('employee.credentials.update'),
//   requireEmployeeAccess({
//     employeeIdParam: 'employeeId',
//     anyEmployeePermission: 'employee.credentials.update',
//     selfPermission: 'employee.self.update',
//   }),
//   CredentialController.createDegree,
// )
router.post(
  '/employee/:employeeId/degrees',
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.credentials.update',
    selfPermission: 'employee.self.update',
  }),

  uploadCredentialDocumentMiddleware,
  CredentialController.createDegree,
)

router.post(
  '/employee/:employeeId/boards',
  //requirePermission('employee.credentials.update'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.credentials.update',
    selfPermission: 'employee.self.update',
  }),
  CredentialController.createBoard,
)

router.post(
  '/employee/:employeeId/fellowships',
  //requirePermission('employee.credentials.update'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.credentials.update',
    selfPermission: 'employee.self.update',
  }),
  CredentialController.createFellowship,
)

router.post(
  '/employee/:employeeId/memberships',
  //requirePermission('employee.credentials.update'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.credentials.update',
    selfPermission: 'employee.self.update',
  }),
  CredentialController.createMembership,
)

router.post(
  '/employee/:employeeId/licenses',
  //requirePermission('employee.credentials.update'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.credentials.update',
    selfPermission: 'employee.self.update',
  }),
  CredentialController.createLicense,
)

router.post(
  '/employee/:employeeId/life-support',
  //requirePermission('employee.credentials.update'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.credentials.update',
    selfPermission: 'employee.self.update',
  }),
  CredentialController.createLifeSupport,
)

router.post(
  '/employee/:employeeId/malpractice',
  //requirePermission('employee.credentials.update'),
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.credentials.update',
    selfPermission: 'employee.self.update',
  }),
  CredentialController.createMalpractice,
)

// -----------------------------------------------
// ALL EDIT/UPDATE
// -----------------------------------------------

// router.patch(
//   '/degrees/:id',
//   requirePermission('employee.credentials.update'),
//   CredentialController.updateDegree,
// )

router.patch(
  '/employee/:employeeId/degrees/:id/verification',
  requirePermission('credential.verify'),
  credentialDocumentUpload.single('evidence'),
  CredentialController.updateDegreeVerification,
)

// router.patch(
//   '/employee/:employeeId/boards/:id/verification',
//   requirePermission('credential.verify'),
//   CredentialController.updateBoardVerification,
// )

// router.patch(
//   '/employee/:employeeId/fellowships/:id/verification',
//   requirePermission('credential.verify'),
//   CredentialController.updateFellowshipVerification,
// )

// router.patch(
//   '/employee/:employeeId/memberships/:id/verification',
//   requirePermission('credential.verify'),
//   CredentialController.updateMembershipVerification,
// )

// router.patch(
//   '/employee/:employeeId/licenses/:id/verification',
//   requirePermission('credential.verify'),
//   CredentialController.updateLicenseVerification,
// )

// router.patch(
//   '/employee/:employeeId/life-support/:id/verification',
//   requirePermission('credential.verify'),
//   CredentialController.updateLifeSupportVerification,
// )

// router.patch(
//   '/employee/:employeeId/malpractice/:id/verification',
//   requirePermission('credential.verify'),
//   CredentialController.updateMalpracticeVerification,
// )

router.patch(
  '/employee/:employeeId/degrees/:id',

  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.credentials.update',
    selfPermission: 'employee.self.update',
  }),

  uploadCredentialDocumentMiddleware,
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
  '/employee/:employeeId/degrees/:id',

  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.credentials.update',
    selfPermission: 'employee.self.update',
  }),

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
