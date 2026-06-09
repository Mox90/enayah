import { Request, Response } from 'express'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import { employeeIdSchema } from '../../employees/dto/employee.request'
import { CredentialService } from '../service/credential.service'

export const CredentialController = {
  getEmployeeCredentials: asyncHandler(async (req: Request, res: Response) => {
    const { id } = employeeIdSchema.parse(req.params)

    const credentials = await CredentialService.getEmployeeCredentials(id)

    res.status(200).json(credentials)
  }),
}
