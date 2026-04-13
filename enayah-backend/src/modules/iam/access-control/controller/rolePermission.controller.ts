import { Request, Response } from 'express'
import { RolePermissionService } from '../service/rolePermission.service'
import { ValidatedRequest } from '../../../../core/types/request'
import {
  AssignPermissionDTO,
  RoleParamsDTO,
  RolePermissionParamsDTO,
} from '../dto/rolePermission.request'
import { AppError } from '../../../../core/errors/AppError'
import { asyncHandler } from '../../../../core/utils/asyncHandler'

//type Params = { roleId: string }
//type Body = { permissionIds: string[] }

export const RolePermissionController = {
  assign: asyncHandler(
    async (
      req: ValidatedRequest<RoleParamsDTO, AssignPermissionDTO>,
      res: Response,
    ) => {
      //const { roleId, permissionIds } = req.body
      const validated = req.validated

      if (!validated?.params || !validated?.body) {
        throw new AppError('Validation middleware missing', 401)
      }

      const { roleId } = validated.params
      const { permissionIds } = validated.body

      const result = await RolePermissionService.assignPermissions(
        roleId,
        permissionIds,
      )

      res.status(200).json(result)
    },
  ),

  getRolePermissions: asyncHandler(
    async (req: ValidatedRequest<RoleParamsDTO>, res: Response) => {
      const validated = req.validated

      if (!validated?.params) {
        throw new AppError('Validation middleware missing', 500)
      }

      const { roleId } = validated.params

      const permissions = await RolePermissionService.getRolePermissions(roleId)

      res.status(200).json(permissions)
    },
  ),

  remove: asyncHandler(
    async (req: ValidatedRequest<RolePermissionParamsDTO>, res: Response) => {
      const validated = req.validated

      if (!validated?.params) {
        throw new AppError('Validation middleware missing', 401)
      }

      const { roleId, permissionId } = validated.params

      await RolePermissionService.removePermission(roleId, permissionId)

      res.status(204).send()
    },
  ),
}
