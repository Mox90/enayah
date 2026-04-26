export interface JobAssignmentResponse {
  id: string
  employmentId: string

  department: {
    id: string
    nameEn: string
  }

  position: {
    id: string
    titleEn: string
  }

  managerId?: string

  startDate: string
  endDate?: string

  isPrimary: boolean
}
