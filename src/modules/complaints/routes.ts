import { Router } from "express";
import { submitComplaint, trackComplaint, getAllComplaints } from "./controller";

const router = Router();

router.post("/", submitComplaint);
router.get("/", getAllComplaints);
router.get("/:refNumber", trackComplaint);

export default router; 