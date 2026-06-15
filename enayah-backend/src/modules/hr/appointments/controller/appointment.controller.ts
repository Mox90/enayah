import { Request, Response } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import {
  appointmentIdSchema,
  createAppointmentSchema,
  employmentIdParamSchema,
  updateAppointmentSchema,
} from '../dto/appointment.request'
import { AppointmentService } from '../service/appointment.service'

const endAppointmentSchema = z.object({
  endDate: z.iso.date(),
  remarks: z.string().trim().nullable().optional(),
})

export const AppointmentController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = createAppointmentSchema.parse(req.body)

    const result = await AppointmentService.create(body)

    res.locals.resourceId = result.id
    res.locals.after = result

    res.status(201).json(result)
  }),

  createForEmployment: asyncHandler(async (req: Request, res: Response) => {
    const { employmentId } = employmentIdParamSchema.parse(req.params)

    const body = createAppointmentSchema.parse({
      ...req.body,
      employmentId,
    })

    const result = await AppointmentService.create(body)

    res.locals.resourceId = result.id
    res.locals.after = result

    res.status(201).json(result)
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = appointmentIdSchema.parse(req.params)

    const result = await AppointmentService.findById(id)

    res.status(200).json(result)
  }),

  findByEmploymentId: asyncHandler(async (req: Request, res: Response) => {
    const { employmentId } = employmentIdParamSchema.parse(req.params)

    const result = await AppointmentService.findByEmploymentId(employmentId)

    res.status(200).json(result)
  }),

  findCurrentByEmploymentId: asyncHandler(
    async (req: Request, res: Response) => {
      const { employmentId } = employmentIdParamSchema.parse(req.params)

      const result =
        await AppointmentService.findCurrentByEmploymentId(employmentId)

      res.status(200).json(result)
    },
  ),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = appointmentIdSchema.parse(req.params)
    const body = updateAppointmentSchema.parse(req.body)

    const result = await AppointmentService.update(id, body)

    res.locals.resourceId = id
    res.locals.after = result

    res.status(200).json(result)
  }),

  endAppointment: asyncHandler(async (req: Request, res: Response) => {
    const { id } = appointmentIdSchema.parse(req.params)
    const body = endAppointmentSchema.parse(req.body)

    const result = await AppointmentService.endAppointment(
      id,
      body.endDate,
      body.remarks,
    )

    res.locals.resourceId = id
    res.locals.after = result

    res.status(200).json(result)
  }),

  softDelete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = appointmentIdSchema.parse(req.params)

    const existing = await AppointmentService.softDelete(id, req.user?.id)

    res.locals.resourceId = id
    res.locals.before = existing
    res.locals.after = null

    res.status(204).send()
  }),
}
