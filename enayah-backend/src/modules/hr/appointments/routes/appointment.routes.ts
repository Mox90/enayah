import { Router } from 'express'
import { requireAuth } from '../../../../core/middleware/auth.middleware'
import {
  attachPermissions,
  requirePermission,
} from '../../../../core/middleware/permission.middleware'
import { audit } from '../../../../core/middleware/audit.middleware'
import { getParam } from '../../../../core/utils/request.utils'
import { AppointmentController } from '../controller/appointment.controller'

const router = Router()

router.use(requireAuth)
router.use(attachPermissions)

router.post(
  '/',
  requirePermission('employee.update'),
  audit('APPOINTMENT_CREATE', {
    resource: 'APPOINTMENT',
  }),
  AppointmentController.create,
)

router.get(
  '/:employmentId/appointments',
  requirePermission('employee.view'),
  AppointmentController.findByEmploymentId,
)

router.get(
  '/:employmentId/appointments/current',
  requirePermission('employee.view'),
  AppointmentController.findCurrentByEmploymentId,
)

router.post(
  '/:employmentId/appointments',
  requirePermission('employee.update'),
  audit('APPOINTMENT_CREATE', {
    resource: 'APPOINTMENT',
    getResourceId: (req) => getParam(req.params.employmentId),
  }),
  AppointmentController.createForEmployment,
)

router.get(
  '/:id',
  requirePermission('employee.view'),
  AppointmentController.findById,
)

router.patch(
  '/:id',
  requirePermission('employee.update'),
  audit('APPOINTMENT_UPDATE', {
    resource: 'APPOINTMENT',
    getResourceId: (req) => getParam(req.params.id),
  }),
  AppointmentController.update,
)

router.patch(
  '/:id/end',
  requirePermission('employee.update'),
  audit('APPOINTMENT_END', {
    resource: 'APPOINTMENT',
    getResourceId: (req) => getParam(req.params.id),
  }),
  AppointmentController.endAppointment,
)

router.delete(
  '/:id',
  requirePermission('employee.update'),
  audit('APPOINTMENT_DELETE', {
    resource: 'APPOINTMENT',
    getResourceId: (req) => getParam(req.params.id),
  }),
  AppointmentController.softDelete,
)

export default router
