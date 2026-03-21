import { Request, Response } from "express";
import { createComplaint, getComplaintByRef, getAllComplaints as fetchAll } from "./service";

export const submitComplaint = async (req: Request, res: Response) => {
  try {
    const complaint = await createComplaint(req.body);
    res.status(201).json({ success: true, refNumber: complaint.refNumber, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to submit complaint" });
  }
};

export const trackComplaint = async (req: Request, res: Response) => {
  try {
   const complaint = await getComplaintByRef(req.params.refNumber as string);
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to track complaint" });
  }
};

export const getAllComplaints = async (req: Request, res: Response) => {
  try {
    const complaints = await fetchAll();
    res.json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch complaints" });
  }
};