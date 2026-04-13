import { Request, Response } from 'express'
import { UserRoleService } from '../service/userRole.service'
import { ValidatedRequest } from '../../../../core/types/request'
import {
  AssignRoleDTO,
  UserParamsDTO,
  UserRoleParamsDTO,
} from '../dto/userRole.request'
import { AppError } from '../../../../core/errors/AppError'

export const UserRoleController = {
  assignRoleToUser: async (
    req: ValidatedRequest<UserParamsDTO, AssignRoleDTO>,
    res: Response,
  ) => {
    const validated = req.validated

    if (!validated?.params || !validated?.body) {
      throw new AppError('Validation middleware missing', 401)
    }

    const { userId } = validated.params
    const { roleId } = validated.body

    const result = await UserRoleService.assignRoleToUser(userId, roleId)

    res.status(200).json(result)
  },

  getUserRoles: async (req: ValidatedRequest<UserParamsDTO>, res: Response) => {
    const validated = req.validated

    if (!validated?.params) {
      throw new AppError('Validation middleware missing', 401)
    }

    const { userId } = validated.params

    const roles = await UserRoleService.getUserRoles(userId)

    res.status(200).json(roles)
  },

  removeRoleFromUser: async (
    req: ValidatedRequest<UserRoleParamsDTO>,
    res: Response,
  ) => {
    const validated = req.validated

    if (!validated?.params) {
      throw new AppError('Validation middleware missing', 401)
    }
    const { userId, roleId } = validated.params

    await UserRoleService.removeRoleFromUser(userId, roleId)

    res.status(204).send()
  },
}
