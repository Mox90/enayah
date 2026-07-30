import { AppError } from '../../../../core/errors/AppError'
import { DB } from '../../../../db'
import { PositionItemRepository } from '../repository/positionItem.repository'

export const validatePositionItemAssignment = async (tx: DB, id: string) => {
  //const item = (await PositionItemRepository.findById(id))[0]
  const item = await PositionItemRepository.findById(tx, id)

  if (!item) {
    throw new AppError('Position item not found', 404)
  }

  if (item.status === 'filled') {
    throw new AppError('Position already filled', 400)
  }

  if (item.status === 'frozen') {
    throw new AppError('Position is frozen', 400)
  }
}
