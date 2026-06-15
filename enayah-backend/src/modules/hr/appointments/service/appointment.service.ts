import { db } from '../../../../db'
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from '../dto/appointment.request'
import { AppointmentRepository } from '../repository/appointment.repository'

export const AppointmentService = {
  create: async (dto: CreateAppointmentDto) => {
    return db.transaction((tx) => AppointmentRepository.create(tx, dto))
  },

  findById: async (id: string) => {
    return AppointmentRepository.findById(db, id)
  },

  findByEmploymentId: async (employmentId: string) => {
    return AppointmentRepository.findByEmploymentId(db, employmentId)
  },

  findCurrentByEmploymentId: async (employmentId: string) => {
    return AppointmentRepository.findCurrentByEmploymentId(db, employmentId)
  },

  update: async (id: string, dto: UpdateAppointmentDto) => {
    return db.transaction((tx) => AppointmentRepository.update(tx, id, dto))
  },

  endAppointment: async (
    id: string,
    endDate: string,
    remarks?: string | null,
  ) => {
    return db.transaction((tx) =>
      AppointmentRepository.endAppointment(tx, id, endDate, remarks),
    )
  },

  softDelete: async (id: string, userId?: string) => {
    return db.transaction((tx) =>
      AppointmentRepository.softDelete(tx, id, userId),
    )
  },
}
