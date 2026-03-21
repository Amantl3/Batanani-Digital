import { Router } from "express";
import {
  dashboardStats,
  dashboardSummary,
  complaintsByCategory,
  complaintsByProvider,
  licencesBySector,
  monthlyTrends,
  complaintResolutionRate,
  topProviders,
  dailyComplaints,
  resolutionTime,
  licenceApprovalRate,
  userActivitySummary,
  expiringLicences,
  filterComplaints,
  recentActivity,
} from "./controller";

const router = Router();

router.get("/stats", dashboardStats);
router.get("/summary", dashboardSummary);
router.get("/complaints-by-category", complaintsByCategory);
router.get("/complaints-by-provider", complaintsByProvider);
router.get("/licences-by-sector", licencesBySector);
router.get("/monthly-trends", monthlyTrends);
router.get("/resolution-rate", complaintResolutionRate);
router.get("/top-providers", topProviders);
router.get("/daily-complaints", dailyComplaints);
router.get("/resolution-time", resolutionTime);
router.get("/licence-approval-rate", licenceApprovalRate);
router.get("/user-activity", userActivitySummary);
router.get("/expiring-licences", expiringLicences);
router.get("/search-complaints", filterComplaints);
router.get("/recent-activity", recentActivity);

export default router;