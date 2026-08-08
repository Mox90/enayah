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

const requireCredentialEmployeeAccess = requireEmployeeAccess({
  employeeIdParam: 'employeeId',
  //anyEmployeePermission: 'employee.view',
  anyEmployeePermission: 'employee.credentials.view',
  selfPermission: 'employee.self.view',
})

// -----------------------------------------------
// ALL ORGIGNAL DOC PREVIEW
// -----------------------------------------------

router.get(
  '/employee/:employeeId/degrees/:id/document/preview',
  requireCredentialEmployeeAccess,
  CredentialController.previewCredentialDocument('degree'),
)

router.get(
  '/employee/:employeeId/boards/:id/document/preview',
  requireCredentialEmployeeAccess,
  CredentialController.previewCredentialDocument('board'),
)

router.get(
  '/employee/:employeeId/fellowships/:id/document/preview',
  requireCredentialEmployeeAccess,
  CredentialController.previewCredentialDocument('fellowship'),
)

router.get(
  '/employee/:employeeId/memberships/:id/document/preview',
  requireCredentialEmployeeAccess,
  CredentialController.previewCredentialDocument('membership'),
)

router.get(
  '/employee/:employeeId/licenses/:id/document/preview',
  requireCredentialEmployeeAccess,
  CredentialController.previewCredentialDocument('license'),
)

router.get(
  '/employee/:employeeId/life-support/:id/document/preview',
  requireCredentialEmployeeAccess,
  CredentialController.previewCredentialDocument('life-support'),
)

router.get(
  '/employee/:employeeId/malpractice/:id/document/preview',
  requireCredentialEmployeeAccess,
  CredentialController.previewCredentialDocument('malpractice'),
)

// -----------------------------------------------
// ALL ORIGINAL DOC DOWNLOAD
// -----------------------------------------------

router.get(
  '/employee/:employeeId/degrees/:id/document/download',
  requireCredentialEmployeeAccess,
  CredentialController.downloadCredentialDocument('degree'),
)

router.get(
  '/employee/:employeeId/boards/:id/document/download',
  requireCredentialEmployeeAccess,
  CredentialController.downloadCredentialDocument('board'),
)

router.get(
  '/employee/:employeeId/fellowships/:id/document/download',
  requireCredentialEmployeeAccess,
  CredentialController.downloadCredentialDocument('fellowship'),
)

router.get(
  '/employee/:employeeId/memberships/:id/document/download',
  requireCredentialEmployeeAccess,
  CredentialController.downloadCredentialDocument('membership'),
)

router.get(
  '/employee/:employeeId/licenses/:id/document/download',
  requireCredentialEmployeeAccess,
  CredentialController.downloadCredentialDocument('license'),
)

router.get(
  '/employee/:employeeId/life-support/:id/document/download',
  requireCredentialEmployeeAccess,
  CredentialController.downloadCredentialDocument('life-support'),
)

router.get(
  '/employee/:employeeId/malpractice/:id/document/download',
  requireCredentialEmployeeAccess,
  CredentialController.downloadCredentialDocument('malpractice'),
)

// -----------------------------------------------
// ALL VERIFICATION DOC PREVIEW
// -----------------------------------------------

router.get(
  '/employee/:employeeId/degrees/:id/verification/events/:eventId/evidence/preview',
  requireCredentialEmployeeAccess,
  CredentialController.previewCredentialVerificationEvidence('degree'),
)

router.get(
  '/employee/:employeeId/boards/:id/verification/events/:eventId/evidence/preview',
  requireCredentialEmployeeAccess,
  CredentialController.previewCredentialVerificationEvidence('board'),
)

router.get(
  '/employee/:employeeId/fellowships/:id/verification/events/:eventId/evidence/preview',
  requireCredentialEmployeeAccess,
  CredentialController.previewCredentialVerificationEvidence('fellowship'),
)

router.get(
  '/employee/:employeeId/memberships/:id/verification/events/:eventId/evidence/preview',
  requireCredentialEmployeeAccess,
  CredentialController.previewCredentialVerificationEvidence('membership'),
)

router.get(
  '/employee/:employeeId/licenses/:id/verification/events/:eventId/evidence/preview',
  requireCredentialEmployeeAccess,
  CredentialController.previewCredentialVerificationEvidence('license'),
)

router.get(
  '/employee/:employeeId/life-support/:id/verification/events/:eventId/evidence/preview',
  requireCredentialEmployeeAccess,
  CredentialController.previewCredentialVerificationEvidence('life-support'),
)

router.get(
  '/employee/:employeeId/malpractice/:id/verification/events/:eventId/evidence/preview',
  requireCredentialEmployeeAccess,
  CredentialController.previewCredentialVerificationEvidence('malpractice'),
)

// -----------------------------------------------
// ALL VERIFICATION DOC DOWNLOAD
// -----------------------------------------------

router.get(
  '/employee/:employeeId/degrees/:id/verification/events/:eventId/evidence/download',
  //requirePermission('credential.verify'),
  requireCredentialEmployeeAccess,
  CredentialController.downloadCredentialVerificationEvidence('degree'),
)

router.get(
  '/employee/:employeeId/boards/:id/verification/events/:eventId/evidence/download',
  //requirePermission('credential.verify'),
  requireCredentialEmployeeAccess,
  CredentialController.downloadCredentialVerificationEvidence('board'),
)

router.get(
  '/employee/:employeeId/fellowships/:id/verification/events/:eventId/evidence/download',
  //requirePermission('credential.verify'),
  requireCredentialEmployeeAccess,
  CredentialController.downloadCredentialVerificationEvidence('fellowship'),
)

router.get(
  '/employee/:employeeId/memberships/:id/verification/events/:eventId/evidence/download',
  //requirePermission('credential.verify'),
  requireCredentialEmployeeAccess,
  CredentialController.downloadCredentialVerificationEvidence('membership'),
)

router.get(
  '/employee/:employeeId/licenses/:id/verification/events/:eventId/evidence/download',
  //requirePermission('credential.verify'),
  requireCredentialEmployeeAccess,
  CredentialController.downloadCredentialVerificationEvidence('license'),
)

router.get(
  '/employee/:employeeId/life-support/:id/verification/events/:eventId/evidence/download',
  //requirePermission('credential.verify'),
  requireCredentialEmployeeAccess,
  CredentialController.downloadCredentialVerificationEvidence('life-support'),
)

router.get(
  '/employee/:employeeId/malpractice/:id/verification/events/:eventId/evidence/download',
  //requirePermission('credential.verify'),
  requireCredentialEmployeeAccess,
  CredentialController.downloadCredentialVerificationEvidence('malpractice'),
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
  uploadCredentialDocumentMiddleware,
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

router.patch(
  '/employee/:employeeId/boards/:id/verification',
  requirePermission('credential.verify'),
  credentialDocumentUpload.single('evidence'),
  CredentialController.updateBoardVerification,
)

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
  '/employee/:employeeId/boards/:id',
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.credentials.update',
    selfPermission: 'employee.self.update',
  }),
  uploadCredentialDocumentMiddleware,
  CredentialController.updateBoard,
)

router.patch(
  '/employee/:employeeId/fellowships/:id',
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.credentials.update',
    selfPermission: 'employee.self.update',
  }),
  uploadCredentialDocumentMiddleware,
  CredentialController.updateFellowship,
)

router.patch(
  '/employee/:employeeId/memberships/:id',
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.credentials.update',
    selfPermission: 'employee.self.update',
  }),
  uploadCredentialDocumentMiddleware,
  CredentialController.updateMembership,
)

router.patch(
  '/employee/:employeeId/licenses/:id',
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.credentials.update',
    selfPermission: 'employee.self.update',
  }),
  uploadCredentialDocumentMiddleware,
  CredentialController.updateLicense,
)

router.patch(
  '/employee/:employeeId/life-support/:id',
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.credentials.update',
    selfPermission: 'employee.self.update',
  }),
  uploadCredentialDocumentMiddleware,
  CredentialController.updateLifeSupport,
)

router.patch(
  '/employee/:employeeId/malpractice/:id',
  requireEmployeeAccess({
    employeeIdParam: 'employeeId',
    anyEmployeePermission: 'employee.credentials.update',
    selfPermission: 'employee.self.update',
  }),
  uploadCredentialDocumentMiddleware,
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
