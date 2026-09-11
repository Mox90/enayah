// export interface Position {
//   id: string
//   titleEn: string
//   titleAr: string
//   gradeId?: string
// }

export interface Position {
  id: string
  titleEn: string
  titleAr?: string | null

  gradeId?: string | null

  workforceCategory:
    | 'physician'
    | 'nurse'
    | 'allied_health'
    | 'administrative'
    | 'support_service'

  categoryCode: number
}

export interface PaginatedPositions {
  data: Position[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PositionListResponse {
  data: Position[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
