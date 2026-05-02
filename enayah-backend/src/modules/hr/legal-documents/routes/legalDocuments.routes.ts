import { Router } from 'express'
import { audit } from '../../../../core/middleware/audit.middleware'
import { requirePermission } from '../../../../core/middleware/permission.middleware'
import { LegalDocumentController } from '../controller/legalDocuments.controller'

const router = Router()

router.post(
  '/',
  requirePermission('legalDocument.create'),
  audit('CREATE_LEGAL_DOCUMENT', {
    resource: 'LEGAL_DOCUMENT',
  }),
  LegalDocumentController.create,
)

export default router
