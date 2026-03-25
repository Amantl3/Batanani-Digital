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

// Static routes MUST come before /:id
router.get('/stats',            licenceStats)
router.get('/recent',           recentLicences)
router.get('/my-applications',  protect, myApplications)
router.get('/pending',          protect, pendingLicences)
router.get('/expiring-soon',    protect, expiringSoonLicences)

router.post('/',                protect, applyForLicence)
router.post('/apply',           protect, applyForLicence)

router.get('/',                 listLicences)
router.get('/:id',              getLicenceById)
router.patch('/:id/status',     protect, updateStatus)

export default router
