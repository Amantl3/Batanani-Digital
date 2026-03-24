import { Request, Response } from "express";
import {
  submitComplaint,
  getAllComplaints,
  getComplaintById,
  trackComplaint,
  updateComplaintStatus,
  getComplaintStats,
  getComplaintsByCategory,
  getComplaintsByProvider,
  getRecentComplaints,
} from "./service";

export const createComplaint = async (req: Request, res: Response) => {
  try {
    const { providerLicenceId, category, description, contact, attachments } = req.body;
    if (!providerLicenceId || !category || !description || !contact) {
      return res.status(400).json({ success: false, error: "providerLicenceId, category, description and contact are required" });
    }
    const data = await submitComplaint({ providerLicenceId, category, description, contact, attachments });
    res.status(201).json({ 
      success: true, 
      referenceNumber: data.referenceNumber,
      data 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const listComplaints = async (req: Request, res: Response) => {
  try {
    const { status, category, provider, page, limit } = req.query as Record<string, string>;
    const data = await getAllComplaints({ status, category, provider, page: page ? Number(page) : 1, limit: limit ? Number(limit) : 10 });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getComplaint = async (req: Request, res: Response) => {
  try {
    const data = await getComplaintById(req.params.id as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
};

export const trackComplaintByRef = async (req: Request, res: Response) => {
  try {
    const data = await trackComplaint(req.params.refNumber as string);
    if (!data.found) {
      return res.status(404).json({ success: false, error: "Complaint not found" });
    }
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, error: "status is required" });
    const data = await updateComplaintStatus(req.params.id as string, status);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const complaintStats = async (req: Request, res: Response) => {
  try {
    const data = await getComplaintStats();
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

export const complaintsByProvider = async (_req: Request, res: Response) => {
  try {
    const data = await getComplaintsByProvider();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const recentComplaints = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const data = await getRecentComplaints(limit);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMyComplaints = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const data = await getAllComplaints({ userId, page: 1, limit: 50 });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};