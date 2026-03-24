import { Router } from "express";
import {
  createComplaint,
  listComplaints,
  getComplaint,
  trackComplaintByRef,
  updateStatus,
  complaintStats,
  complaintsByCategory,
  complaintsByProvider,
  recentComplaints,
} from "./controller";

const router = Router();

// Stats
router.get("/stats", complaintStats);
router.get("/by-category", complaintsByCategory);
router.get("/by-provider", complaintsByProvider);
router.get("/recent", recentComplaints);

// Track by reference number (what frontend uses after submit)
router.get("/track/:refNumber", trackComplaintByRef);

// CRUD
router.get("/", listComplaints);
router.get("/:id", getComplaint);
router.post("/", createComplaint);
router.patch("/:id/status", updateStatus);

export default router;