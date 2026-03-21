import { Request, Response } from "express";
import {
  getDashboardStats,
  getDashboardSummary,
  getComplaintsByCategory,
  getComplaintsByProvider,
  getLicencesBySector,
  getMonthlyTrends,
  getComplaintResolutionRate,
  getTopProviders,
  getDailyComplaintsLast7Days,
  getResolutionTime,
  getLicenceApprovalRate,
  getUserActivitySummary,
  getExpiringLicences,
  searchComplaints,
  getRecentActivity,
} from "./service";

export const dashboardStats = async (req: Request, res: Response) => {
  try {
    const data = await getDashboardStats();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const dashboardSummary = async (req: Request, res: Response) => {
  try {
    const data = await getDashboardSummary();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const complaintsByCategory = async (req: Request, res: Response) => {
  try {
    const data = await getComplaintsByCategory();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const complaintsByProvider = async (req: Request, res: Response) => {
  try {
    const data = await getComplaintsByProvider();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const licencesBySector = async (req: Request, res: Response) => {
  try {
    const data = await getLicencesBySector();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const monthlyTrends = async (req: Request, res: Response) => {
  try {
    const data = await getMonthlyTrends();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const complaintResolutionRate = async (req: Request, res: Response) => {
  try {
    const data = await getComplaintResolutionRate();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const topProviders = async (req: Request, res: Response) => {
  try {
    const data = await getTopProviders();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const dailyComplaints = async (req: Request, res: Response) => {
  try {
    const data = await getDailyComplaintsLast7Days();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const resolutionTime = async (req: Request, res: Response) => {
  try {
    const data = await getResolutionTime();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const licenceApprovalRate = async (req: Request, res: Response) => {
  try {
    const data = await getLicenceApprovalRate();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const userActivitySummary = async (req: Request, res: Response) => {
  try {
    const data = await getUserActivitySummary();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const expiringLicences = async (req: Request, res: Response) => {
  try {
    const data = await getExpiringLicences();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const filterComplaints = async (req: Request, res: Response) => {
  try {
    const { provider, category, status } = req.query as {
      provider?: string;
      category?: string;
      status?: string;
    };
    const data = await searchComplaints({ provider, category, status });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const recentActivity = async (req: Request, res: Response) => {
  try {
    const data = await getRecentActivity();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};