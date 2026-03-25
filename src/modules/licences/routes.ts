import { Router } from 'express'
import {
  listLicences, getLicenceById, applyForLicence,
  updateStatus, licenceStats, recentLicences,
  pendingLicences, expiringSoonLicences, myApplications,
} from './controller'
import { protect } from '../../middleware/auth'

const router = Router()

// Named/static routes MUST come before /:id to avoid route conflicts
router.get('/stats',           licenceStats)
router.get('/recent',          recentLicences)
router.get('/pending',         protect, pendingLicences)
router.get('/expiring-soon',   protect, expiringSoonLicences)
router.get('/my-applications', protect, myApplications)

// POST / and POST /apply are the same handler
router.post('/',               protect, applyForLicence)
router.post('/apply',          protect, applyForLicence)

router.get('/',                listLicences)
router.get('/:id',             getLicence)
router.patch('/:id/status',    protect, updateStatus)

export default router
