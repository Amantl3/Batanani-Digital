// src/modules/analytics/controller.ts

import { Request, Response } from 'express';
import * as service from './service';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await service.getDashboardSummary();
    const marketShare = await service.getMarketShareData();

    res.json({
      success: true,
      data: {
        ...stats,
        marketShare
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ NEW ENDPOINT
export const getComplaintsAnalytics = async (req: Request, res: Response) => {
  try {
    const data = await service.getComplaintsAnalytics();

    res.json({
      success: true,
      data
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};