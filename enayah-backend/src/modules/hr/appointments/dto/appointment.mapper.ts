import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from './appointment.request'

export function toAppointmentDb(dto: CreateAppointmentDto) {
  return {
    employmentId: dto.employmentId,

    actualDepartmentId: dto.actualDepartmentId ?? null,
    actualPositionId: dto.actualPositionId ?? null,
    managerId: dto.managerId ?? null,

    startDate: dto.startDate,
    endDate: dto.endDate ?? null,

    appointmentType: dto.appointmentType,
    assignmentReason: dto.assignmentReason ?? null,

    remarks: dto.remarks ?? null,

    approvedBy: dto.approvedBy ?? null,
    approvedAt: dto.approvedAt ?? null,
  }
}

export function toAppointmentUpdateDb(dto: UpdateAppointmentDto) {
  return {
    ...(dto.actualDepartmentId !== undefined && {
      actualDepartmentId: dto.actualDepartmentId,
    }),

    ...(dto.actualPositionId !== undefined && {
      actualPositionId: dto.actualPositionId,
    }),

    ...(dto.managerId !== undefined && {
      managerId: dto.managerId,
    }),

    ...(dto.startDate !== undefined && {
      startDate: dto.startDate,
    }),

    ...(dto.endDate !== undefined && {
      endDate: dto.endDate,
    }),

    ...(dto.appointmentType !== undefined && {
      appointmentType: dto.appointmentType,
    }),

    ...(dto.assignmentReason !== undefined && {
      assignmentReason: dto.assignmentReason,
    }),

    ...(dto.remarks !== undefined && {
      remarks: dto.remarks,
    }),

    ...(dto.approvedBy !== undefined && {
      approvedBy: dto.approvedBy,
    }),

    ...(dto.approvedAt !== undefined && {
      approvedAt: dto.approvedAt,
    }),
  }
}
