import { Router } from "express";
import {
  listLicences,
  getLicence,
  applyForLicence,
  updateStatus,
  removeLicence,
  licenceStats,
  licencesByType,
  recentLicences,
  pendingLicences,
  expiringSoonLicences,
  licencesThisMonth,
  verifyLicencePublic,
  licenceRenewals,
  licenceHistory,
  licencesByUser,
  mostCommonLicenceTypes,
  suspendedLicences,
} from "./controller";
import { protect } from "../../middleware/auth";

const router = Router();

// Stats & summaries — public
router.get("/stats", licenceStats);
router.get("/by-type", licencesByType);
router.get("/recent", recentLicences);
router.get("/pending", pendingLicences);
router.get("/expiring-soon", expiringSoonLicences);
router.get("/this-month", licencesThisMonth);
router.get("/renewals", licenceRenewals);
router.get("/common-types", mostCommonLicenceTypes);
router.get("/suspended", suspendedLicences);

// User specific — protected
router.get("/user/:userId", protect, licencesByUser);

// CRUD — protect write operations
router.get("/", listLicences);
router.get("/:id", getLicence);
router.post("/", protect, applyForLicence);
router.patch("/:id/status", protect, updateStatus);
router.delete("/:id", protect, removeLicence);

// Single licence extras — public
router.get("/:id/verify", verifyLicencePublic);
router.get("/:id/history", licenceHistory);

export default router;