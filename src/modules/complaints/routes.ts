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
  getMyComplaints,
} from "./controller";
import { protect } from "../../middleware/auth";

const router = Router();

router.get("/stats", complaintStats);
router.get("/by-category", complaintsByCategory);
router.get("/by-provider", complaintsByProvider);
router.get("/recent", recentComplaints);
router.get("/mine", protect, getMyComplaints);
router.get("/track/:refNumber", trackComplaintByRef);
router.get("/", listComplaints);
router.get("/:id", getComplaint);
router.post("/", protect, createComplaint);
router.patch("/:id/status", protect, updateStatus);

export default router;