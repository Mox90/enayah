import { Router } from 'express'
import { PositionItemController } from '../controller/positionItem.controller'

const router = Router()

router.post('/', PositionItemController.create)
router.post('/:id/assign', PositionItemController.assign)

export default router
