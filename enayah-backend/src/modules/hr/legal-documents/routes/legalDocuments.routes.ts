import { audit } from '../../../../core/middleware/audit.middleware'
import { requirePermission } from '../../../../core/middleware/permission.middleware'
import router from '../../job-grade/routes/jobGrade.routes'
import { LegalDocumentController } from '../controller/legalDocuments.controller'

router.post(
  '/',
  requirePermission('legalDocument.create'),
  audit('CREATE_LEGAL_DOCUMENT', {
    resource: 'LEGAL_DOCUMENT',
  }),
  LegalDocumentController.create,
)
