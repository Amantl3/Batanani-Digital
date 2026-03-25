import { Router } from 'express'
import {
  listLicences, getLicence, applyForLicence,
  updateStatus, licenceStats, recentLicences,
  pendingLicences, expiringSoonLicences,
} from './controller'
import { protect } from '../../middleware/auth'

const router = Router()

router.get('/stats',         licenceStats)
router.get('/recent',        recentLicences)
router.get('/pending',       protect, pendingLicences)
router.get('/expiring-soon', protect, expiringSoonLicences)
router.get('/',              listLicences)
router.get('/:id',           getLicence)
router.post('/',             protect, applyForLicence)
router.patch('/:id/status',  protect, updateStatus)

export default router
