import { Router } from 'express'
import { PositionItemController } from '../controller/positionItem.controller'
import { audit } from '../../../../core/middleware/audit.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import { getParam } from '../../../../core/utils/request.utils'
import { PositionController } from '../../positions/controller/position.controller'

const router = Router()

router.use(requireAuth)
router.use(attachPermissions)

router.get(
  '/org-view',
  requirePermission('position.items.view'),
  PositionItemController.findOrganizationHierarchyView,
)
router.get(
  '/manpower-view',
  requirePermission('position.items.view'),
  PositionItemController.findManpowerView,
)
router.get('/lookup', PositionItemController.findLookup)
router.get('/', PositionItemController.findPaginated)
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
