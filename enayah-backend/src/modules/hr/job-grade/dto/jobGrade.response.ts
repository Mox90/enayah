export interface JobGradeResponseDTO {
  id: string
  name: string
  description: string | null
  minSalary: number | null
  maxSalary: number | null
  createdAt: Date
}
