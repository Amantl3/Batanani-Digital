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

const router = Router();

// Stats & summaries
router.get("/stats", licenceStats);
router.get("/by-type", licencesByType);
router.get("/recent", recentLicences);
router.get("/pending", pendingLicences);
router.get("/expiring-soon", expiringSoonLicences);
router.get("/this-month", licencesThisMonth);
router.get("/renewals", licenceRenewals);
router.get("/common-types", mostCommonLicenceTypes);
router.get("/suspended", suspendedLicences);

// User specific
router.get("/user/:userId", licencesByUser);

// CRUD
router.get("/", listLicences);
router.get("/:id", getLicence);
router.post("/", applyForLicence);
router.patch("/:id/status", updateStatus);
router.delete("/:id", removeLicence);

// Single licence extras
router.get("/:id/verify", verifyLicencePublic);
router.get("/:id/history", licenceHistory);

export default router;