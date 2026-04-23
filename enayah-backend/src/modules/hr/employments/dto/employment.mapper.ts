import { CreateEmploymentDto } from './employment.request'
import { EmploymentResponse } from './employment.response'

export const toEmploymentResponse = (e: any): EmploymentResponse => ({
  id: e.id,
  employeeId: e.employeeId,
  staffCategory: e.staffCategory,
  positionItemId: e.positionItemId ?? undefined,
  status: e.status,
  startDate: e.startDate,
  endDate: e.endDate ?? undefined,
})

export const toEmploymentDb = (e: CreateEmploymentDto) => ({
  employeeId: e.employeeId,
  staffCategory: e.staffCategory,
  positionItemId: e.positionItemId ?? undefined,
  //status: e.status,
  hireDate: e.hireDate,
  startDate: e.startDate,
  endDate: e.endDate ?? undefined,
  employmentType: e.employmentType ?? undefined,
})

const mapEmploymentType = (type?: string) => {
  if (!type) return undefined

  switch (type) {
    case 'full-time':
      return 'full_time'
    case 'part-time':
      return 'part_time'
    case 'locum':
      return 'locum'
    default:
      return undefined
  }
}
