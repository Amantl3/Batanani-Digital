import { Request, Response } from "express";
import {
  getAllLicences,
  getLicenceById,
  createLicence,
  updateLicenceStatus,
  deleteLicence,
  getLicenceStats,
  getLicencesByType,
  getRecentLicences,
  getPendingLicences,
  getExpiringSoonLicences,
  getLicencesIssuedThisMonth,
  verifyLicence,
  getLicenceRenewals,       // ← new
  getLicenceHistory,        // ← new
  getLicencesByUser,        // ← new
  getMostCommonLicenceTypes,// ← new
  getSuspendedLicences,     // ← new
} from "./service";

export const listLicences = async (req: Request, res: Response) => {
  try {
    const { search, type, status, page, limit } = req.query as Record<string, string>;
    const data = await getAllLicences({
      search,
      type,
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getLicence = async (req: Request, res: Response) => {
  try {
    const data = await getLicenceById(req.params.id as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
};

export const applyForLicence = async (req: Request, res: Response) => {
  try {
    const { type, companyName, userId } = req.body;
    if (!type || !companyName || !userId) {
      return res.status(400).json({
        success: false,
        error: "type, companyName and userId are required",
      });
    }
    const data = await createLicence({ type, companyName, userId });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: "status is required" });
    }
    const data = await updateLicenceStatus(req.params.id as string, status);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const removeLicence = async (req: Request, res: Response) => {
  try {
    const data = await deleteLicence(req.params.id as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const licenceStats = async (req: Request, res: Response) => {
  try {
    const data = await getLicenceStats();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const licencesByType = async (req: Request, res: Response) => {
  try {
    const data = await getLicencesByType();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const recentLicences = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const data = await getRecentLicences(limit);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const pendingLicences = async (req: Request, res: Response) => {
  try {
    const data = await getPendingLicences();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const expiringSoonLicences = async (req: Request, res: Response) => {
  try {
    const data = await getExpiringSoonLicences();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const licencesThisMonth = async (req: Request, res: Response) => {
  try {
    const data = await getLicencesIssuedThisMonth();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const verifyLicencePublic = async (req: Request, res: Response) => {
  try {
    const data = await verifyLicence(req.params.id as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const licenceRenewals = async (req: Request, res: Response) => {
  try {
    const data = await getLicenceRenewals();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const licenceHistory = async (req: Request, res: Response) => {
  try {
    const data = await getLicenceHistory(req.params.id as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
};

export const licencesByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "userId is required" });
    }
    const data = await getLicencesByUser(userId as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const mostCommonLicenceTypes = async (req: Request, res: Response) => {
  try {
    const data = await getMostCommonLicenceTypes();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const suspendedLicences = async (req: Request, res: Response) => {
  try {
    const data = await getSuspendedLicences();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};