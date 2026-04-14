import { Router } from 'express'
import { PositionItemController } from '../controller/positionItem.controller'
import { audit } from '../../../../core/middleware/audit.middleware'

const router = Router()

router.post('/', PositionItemController.create)
router.post(
  '/:id/assign',
  audit('ASSIGN_POSITION_ITEM', 'POSITION_ITEM', (req) =>
    typeof req.params.id === 'string' ? req.params.id : undefined,
  ),
  PositionItemController.assign,
)

export default router
