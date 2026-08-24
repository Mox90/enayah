import { StaffCategory } from '../../employments/types/employment.types'

export interface EmployeeProfile {
  personal: {
    id: string
    employeeNumber: string

    firstNameEn: string
    secondNameEn: string | null
    thirdNameEn: string | null
    familyNameEn: string

    firstNameAr: string
    secondNameAr: string | null
    thirdNameAr: string | null
    familyNameAr: string

    gender: 'male' | 'female'
    dateOfBirth: string | null

    avatarFileId: string | null
    avatar: string | null

    nationality: {
      id: string

      name: string
      nameAr: string | null

      nationalityEn: string
      nationalityAr: string | null

      alpha2: string
      alpha3: string
      numericCode: string
    } | null

    version: number
  }

  employment: {
    id: string
    hireDate: string
    startDate: string
    endDate: string | null
    employmentType: string | null
    staffCategory: StaffCategory
    status: string
    contract: {
      id: string
      contractNumber: string
      contractType: string
      startDate: string
      endDate: string
    }
    movement: {
      id: string
      sequenceNumber: number
      movementType: string
      positionItem: {
        id: string
        itemNumber: string
        categoryCode: number | null
        workforceCategory: string | null
      }
      officialDepartment: {
        id: string
        nameEn: string
        nameAr: string | null
      }
      officialPosition: {
        id: string
        titleEn: string
        titleAr: string | null
      }

      compensation?: {
        id: string
        baseSalary: number | string
        effectiveDate: string
        status: 'draft' | 'approved' | 'applied'
        reason?: string | null
        allowances: {
          id: string
          type: string
          amount: number | string
        }[]
      } | null
    }
  }
}

export type EmployeeAvatarUploadResponse = {
  avatarFileId: string
  avatarUrl: string
  mimeType: 'image/webp'
  fileSize: number
  checksumSha256: string
}
