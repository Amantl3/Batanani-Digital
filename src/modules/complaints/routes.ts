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

router.get("/stats",              complaintStats);
router.get("/by-category",        complaintsByCategory);
router.get("/by-provider",        complaintsByProvider);
router.get("/recent",             recentComplaints);
router.get("/mine",               getMyComplaints);
router.get("/track/:refNumber",   trackComplaintByRef);
router.get("/",                   listComplaints);
router.get("/:id",                getComplaint);
router.post("/",                  createComplaint);
router.patch("/:id/status",       protect, updateStatus);

export default router;
