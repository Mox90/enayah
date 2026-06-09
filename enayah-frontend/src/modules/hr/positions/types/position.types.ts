export interface Position {
  id: string
  titleEn: string
  titleAr: string
  gradeId?: string
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
}
