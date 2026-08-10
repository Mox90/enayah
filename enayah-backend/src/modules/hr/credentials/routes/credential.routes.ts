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

const requireCredentialEmployeeUpdateAccess = requireEmployeeAccess({
  employeeIdParam: 'employeeId',
  anyEmployeePermission: 'employee.credentials.update',
  selfPermission: 'employee.self.update',
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
  requireCredentialEmployeeUpdateAccess,
  CredentialController.createAll,
)

router.post(
  '/employee/:employeeId/degrees',
  requireCredentialEmployeeUpdateAccess,
  uploadCredentialDocumentMiddleware,
  CredentialController.createCredential('degree'),
)

router.post(
  '/employee/:employeeId/boards',
  requireCredentialEmployeeUpdateAccess,
  uploadCredentialDocumentMiddleware,
  CredentialController.createCredential('board'),
)

router.post(
  '/employee/:employeeId/fellowships',
  requireCredentialEmployeeUpdateAccess,
  uploadCredentialDocumentMiddleware,
  CredentialController.createCredential('fellowship'),
)

router.post(
  '/employee/:employeeId/memberships',
  requireCredentialEmployeeUpdateAccess,
  uploadCredentialDocumentMiddleware,
  CredentialController.createCredential('membership'),
)

router.post(
  '/employee/:employeeId/licenses',
  requireCredentialEmployeeUpdateAccess,
  uploadCredentialDocumentMiddleware,
  CredentialController.createCredential('license'),
)

router.post(
  '/employee/:employeeId/life-support',
  requireCredentialEmployeeUpdateAccess,
  uploadCredentialDocumentMiddleware,
  CredentialController.createCredential('life-support'),
)

router.post(
  '/employee/:employeeId/malpractice',
  requireCredentialEmployeeUpdateAccess,
  uploadCredentialDocumentMiddleware,
  CredentialController.createCredential('malpractice'),
)

// -----------------------------------------------
// ALL EDIT/UPDATE
// -----------------------------------------------

router.patch(
  '/employee/:employeeId/degrees/:id',
  requireCredentialEmployeeUpdateAccess,
  uploadCredentialDocumentMiddleware,
  CredentialController.updateCredential('degree'),
)

router.patch(
  '/employee/:employeeId/boards/:id',
  requireCredentialEmployeeUpdateAccess,
  uploadCredentialDocumentMiddleware,
  CredentialController.updateCredential('board'),
)

router.patch(
  '/employee/:employeeId/fellowships/:id',
  requireCredentialEmployeeUpdateAccess,
  uploadCredentialDocumentMiddleware,
  CredentialController.updateCredential('fellowship'),
)

router.patch(
  '/employee/:employeeId/memberships/:id',
  requireCredentialEmployeeUpdateAccess,
  uploadCredentialDocumentMiddleware,
  CredentialController.updateCredential('membership'),
)

router.patch(
  '/employee/:employeeId/licenses/:id',
  requireCredentialEmployeeUpdateAccess,
  uploadCredentialDocumentMiddleware,
  CredentialController.updateCredential('license'),
)

router.patch(
  '/employee/:employeeId/life-support/:id',
  requireCredentialEmployeeUpdateAccess,
  uploadCredentialDocumentMiddleware,
  CredentialController.updateCredential('life-support'),
)

router.patch(
  '/employee/:employeeId/malpractice/:id',
  requireCredentialEmployeeUpdateAccess,
  uploadCredentialDocumentMiddleware,
  CredentialController.updateCredential('malpractice'),
)

router.patch(
  '/employee/:employeeId/degrees/:id/verification',
  requirePermission('credential.verify'),
  credentialDocumentUpload.single('evidence'),
  CredentialController.updateCredentialVerification('degree'),
)

router.patch(
  '/employee/:employeeId/boards/:id/verification',
  requirePermission('credential.verify'),
  credentialDocumentUpload.single('evidence'),
  CredentialController.updateCredentialVerification('board'),
)

router.patch(
  '/employee/:employeeId/fellowships/:id/verification',
  requirePermission('credential.verify'),
  credentialDocumentUpload.single('evidence'),
  CredentialController.updateCredentialVerification('fellowship'),
)

router.patch(
  '/employee/:employeeId/memberships/:id/verification',
  requirePermission('credential.verify'),
  credentialDocumentUpload.single('evidence'),
  CredentialController.updateCredentialVerification('membership'),
)

router.patch(
  '/employee/:employeeId/licenses/:id/verification',
  requirePermission('credential.verify'),
  credentialDocumentUpload.single('evidence'),
  CredentialController.updateCredentialVerification('license'),
)

// router.patch(
//   '/employee/:employeeId/degrees/:id',
//   requireCredentialEmployeeUpdateAccess,
//   uploadCredentialDocumentMiddleware,
//   CredentialController.updateDegree,
// )

// router.patch(
//   '/employee/:employeeId/boards/:id',
//   requireCredentialEmployeeUpdateAccess,
//   uploadCredentialDocumentMiddleware,
//   CredentialController.updateBoard,
// )

// router.patch(
//   '/employee/:employeeId/fellowships/:id',
//   requireCredentialEmployeeUpdateAccess,
//   uploadCredentialDocumentMiddleware,
//   CredentialController.updateFellowship,
// )

// router.patch(
//   '/employee/:employeeId/memberships/:id',
//   requireCredentialEmployeeUpdateAccess,
//   uploadCredentialDocumentMiddleware,
//   CredentialController.updateMembership,
// )

// router.patch(
//   '/employee/:employeeId/licenses/:id',
//   requireCredentialEmployeeUpdateAccess,
//   uploadCredentialDocumentMiddleware,
//   CredentialController.updateLicense,
// )

// router.patch(
//   '/employee/:employeeId/life-support/:id',
//   requireCredentialEmployeeUpdateAccess,
//   uploadCredentialDocumentMiddleware,
//   CredentialController.updateLifeSupport,
// )

// router.patch(
//   '/employee/:employeeId/malpractice/:id',
//   requireCredentialEmployeeUpdateAccess,
//   uploadCredentialDocumentMiddleware,
//   CredentialController.updateMalpractice,
// )

// -----------------------------------------------
// ALL DELETE
// -----------------------------------------------

router.delete(
  '/employee/:employeeId/degrees/:id',
  requireCredentialEmployeeUpdateAccess,
  CredentialController.deleteCredential('degree'),
)

router.delete(
  '/employee/:employeeId/boards/:id',
  requireCredentialEmployeeUpdateAccess,
  CredentialController.deleteCredential('board'),
)

router.delete(
  '/employee/:employeeId/fellowships/:id',
  requireCredentialEmployeeUpdateAccess,
  CredentialController.deleteCredential('fellowship'),
)

router.delete(
  '/employee/:employeeId/memberships/:id',
  requireCredentialEmployeeUpdateAccess,
  CredentialController.deleteCredential('membership'),
)

router.delete(
  '/employee/:employeeId/licenses/:id',
  requireCredentialEmployeeUpdateAccess,
  CredentialController.deleteCredential('license'),
)

router.delete(
  '/employee/:employeeId/life-support/:id',
  requireCredentialEmployeeUpdateAccess,
  CredentialController.deleteCredential('life-support'),
)

router.delete(
  '/employee/:employeeId/malpractice/:id',
  requireCredentialEmployeeUpdateAccess,
  CredentialController.deleteCredential('malpractice'),
)

// router.delete(
//   '/employee/:employeeId/degrees/:id',
//   requireEmployeeAccess({
//     employeeIdParam: 'employeeId',
//     anyEmployeePermission: 'employee.credentials.update',
//     selfPermission: 'employee.self.update',
//   }),

//   CredentialController.deleteDegree,
// )

// router.delete(
//   '/boards/:id',
//   requirePermission('employee.credentials.update'),
//   CredentialController.deleteBoard,
// )

// router.delete(
//   '/fellowships/:id',
//   requirePermission('employee.credentials.update'),
//   CredentialController.deleteFellowship,
// )

// router.delete(
//   '/memberships/:id',
//   requirePermission('employee.credentials.update'),
//   CredentialController.deleteMembership,
// )

// router.delete(
//   '/licenses/:id',
//   requirePermission('employee.credentials.update'),
//   CredentialController.deleteLicense,
// )

// router.delete(
//   '/life-support/:id',
//   requirePermission('employee.credentials.update'),
//   CredentialController.deleteLifeSupport,
// )

// router.delete(
//   '/malpractice/:id',
//   requirePermission('employee.credentials.update'),
//   CredentialController.deleteMalpractice,
// )

export default router
