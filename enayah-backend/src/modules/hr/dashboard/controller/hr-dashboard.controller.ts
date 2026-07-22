// enayah-backend/src/modules/hr/dashboard/controllers/hr-dashboard.controller.ts

import type { NextFunction, Request, Response } from 'express'
import { HrDashboardService } from '../service/hr-dashboard.service'

export const HrDashboardController = {
  getAdminDashboard: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const yearQuery = req.query.year
      const year = typeof yearQuery === 'string' ? Number(yearQuery) : undefined

      if (
        yearQuery !== undefined &&
        (!Number.isInteger(year) || Number(year) < 1900)
      ) {
        res.status(400).json({
          message: 'The dashboard year must be a valid integer.',
          code: 'INVALID_DASHBOARD_YEAR',
        })

        return
      }

      const data = await HrDashboardService.getAdminDashboard(year)

      res.status(200).json({
        data,
      })
    } catch (error) {
      next(error)
    }
  },
}
