// employee.mapper.ts
import { EmployeeResponse } from './employee.response'
import { CreateEmployeeDto, UpdateEmployeeDto } from './employee.request'

export const toEmployeeDb = (dto: CreateEmployeeDto) => ({
  employeeNumber: dto.employeeNumber,

  firstNameEn: dto.firstNameEn,
  secondNameEn: dto.secondNameEn,
  thirdNameEn: dto.thirdNameEn,
  familyNameEn: dto.familyNameEn,

  firstNameAr: dto.firstNameAr,
  secondNameAr: dto.secondNameAr,
  thirdNameAr: dto.thirdNameAr,
  familyNameAr: dto.familyNameAr,

  dateOfBirth: dto.dateOfBirth,
  gender: dto.gender,

  countryId: dto.countryId,
})

export const toEmployeeUpdateDb = (dto: UpdateEmployeeDto) => ({
  ...(dto.firstNameEn !== undefined && { firstNameEn: dto.firstNameEn }),
  ...(dto.secondNameEn !== undefined && { secondNameEn: dto.secondNameEn }),
  ...(dto.thirdNameEn !== undefined && { thirdNameEn: dto.thirdNameEn }),
  ...(dto.familyNameEn !== undefined && { familyNameEn: dto.familyNameEn }),

  ...(dto.firstNameAr !== undefined && { firstNameAr: dto.firstNameAr }),
  ...(dto.secondNameAr !== undefined && { secondNameAr: dto.secondNameAr }),
  ...(dto.thirdNameAr !== undefined && { thirdNameAr: dto.thirdNameAr }),
  ...(dto.familyNameAr !== undefined && { familyNameAr: dto.familyNameAr }),

  ...(dto.dateOfBirth !== undefined && { dateOfBirth: dto.dateOfBirth }),
  ...(dto.gender !== undefined && { gender: dto.gender }),

  ...(dto.countryId !== undefined && { countryId: dto.countryId }),
})

export const toEmployeeResponse = (employee: any): EmployeeResponse => {
  return {
    id: employee.id,
    employeeNumber: employee.employeeNumber,
    fullNameEn: [
      employee.firstNameEn,
      employee.secondNameEn,
      employee.thirdNameEn,
      employee.familyNameEn,
    ]
      .filter(Boolean)
      .join(' '),

    fullNameAr: [
      employee.firstNameAr,
      employee.secondNameAr,
      employee.thirdNameAr,
      employee.familyNameAr,
    ]
      .filter(Boolean)
      .join(' '),

    gender: employee.gender,
  }
}
