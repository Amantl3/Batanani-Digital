import { Router } from "express";
import { submitComplaint, trackComplaint, getAllComplaints } from "./controller";
import { protect } from "../../middleware/auth";

const router = Router();

router.post("/", protect, submitComplaint);
router.get("/", getAllComplaints);
router.get("/:refNumber", trackComplaint);

export default router;