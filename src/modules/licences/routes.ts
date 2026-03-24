/**
 * src/modules/licences/routes.ts
 */
import { Router } from 'express'
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
} from './controller'
import { protect } from '../../middleware/auth'

const router = Router()

// ── Named/aggregate routes — must come BEFORE /:id routes ────────────────────
router.get('/stats',         licenceStats)
router.get('/by-type',       licencesByType)
router.get('/recent',        recentLicences)
router.get('/pending',       pendingLicences)
router.get('/expiring-soon', expiringSoonLicences)
router.get('/this-month',    licencesThisMonth)
router.get('/renewals',      licenceRenewals)
router.get('/common-types',  mostCommonLicenceTypes)
router.get('/suspended',     suspendedLicences)

// ── User-specific — protected ─────────────────────────────────────────────────
router.get('/user/:userId', protect, licencesByUser)

// ── Main CRUD ─────────────────────────────────────────────────────────────────
router.get('/',    listLicences)             // public
router.post('/',   protect, applyForLicence) // protected
router.get('/:id', getLicence)               // public

router.patch ('/:id/status', protect, updateStatus)
router.delete('/:id',        protect, removeLicence)

// ── Per-licence extras ────────────────────────────────────────────────────────
router.get('/:id/verify',  verifyLicencePublic)
router.get('/:id/history', licenceHistory)

export default router