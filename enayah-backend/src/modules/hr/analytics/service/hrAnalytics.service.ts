import { HrAnalyticsRepository } from '../repository/hrAnalytics.repository'
import { HeadcountDto } from '../dto/headcount.request'
import { toHeadcountResponse } from '../dto/analytics.mapper'

export const HrAnalyticsService = {
  getHeadcount: async (dto: HeadcountDto) => {
    const rows = await HrAnalyticsRepository.headcount(dto)

    return toHeadcountResponse(rows, dto)
  },
}
