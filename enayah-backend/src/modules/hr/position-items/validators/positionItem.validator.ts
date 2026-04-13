import { AppError } from '../../../../core/errors/AppError'
import { PositionItemRepository } from '../repository/positionItem.repository'

export const validatePositionItemAssignment = async (id: string) => {
  //const item = (await PositionItemRepository.findById(id))[0]
  const item = await PositionItemRepository.findById(id)

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
