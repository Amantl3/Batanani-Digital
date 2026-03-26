/**
 * src/modules/licences/routes.ts
 */
import { Router } from 'express'
import {
  listLicences,
  getLicenceById,
  applyForLicence,
  updateStatus,
  licenceStats,
  recentLicences,
  pendingLicences,
  expiringSoonLicences,
  myApplications,
} from './controller'
import { protect } from '../../middleware/auth'

const router = Router()

// 1. PUBLIC ROUTES (No 'protect' so the Dashboard loads instantly)
router.get('/stats',            licenceStats)
router.get('/recent',           recentLicences)
router.get('/',                 listLicences)
router.get('/:id',              getLicenceById)

// 2. PROTECTED ROUTES (Need login/token)
router.get('/my-applications',  protect, myApplications)
router.get('/pending',          protect, pendingLicences)
router.get('/expiring-soon',    protect, expiringSoonLicences)

router.post('/',                protect, applyForLicence)
router.post('/apply',           protect, applyForLicence)
router.patch('/:id/status',     protect, updateStatus)

export default router