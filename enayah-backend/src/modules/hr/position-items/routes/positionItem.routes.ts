import { Router } from 'express'
import { PositionItemController } from '../controller/positionItem.controller'
import { audit } from '../../../../core/middleware/audit.middleware'
import { requirePermission } from '../../../../core/middleware/permission.middleware'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { getParam } from '../../../../core/utils/request.utils'

const router = Router()

router.use(requireAuth)

router.get('/', PositionItemController.findAll)
router.get('/:id', PositionItemController.findById)
router.post(
  '/',
  requirePermission('position.items.create'),
  audit('CREATE_POSITION_ITEM', {
    resource: 'POSITION_ITEM',
  }),
  PositionItemController.create,
)
router.post(
  '/:id/assign',
  requirePermission('position.items.create'),
  audit('ASSIGN_POSITION_ITEM', {
    resource: 'POSITION_ITEM',
    getResourceId: (req) => getParam(req.params.id),
  }),
  PositionItemController.assign,
)
router.patch(
  '/:id',
  requirePermission('position.items.update'),
  audit('UPDATE_POSITION_ITEM', {
    resource: 'POSITION_ITEM',
    getResourceId: (req) => getParam(req.params.id),
  }),
  PositionItemController.update,
)
router.delete(
  '/:id',
  requirePermission('position.items.delete'),
  audit('DELETE_POSITION_ITEM', {
    resource: 'POSITION_ITEM',
    getResourceId: (req) => getParam(req.params.id),
  }),
  PositionItemController.delete,
)

export default router
