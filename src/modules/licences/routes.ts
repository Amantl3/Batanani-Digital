import { Router } from 'express'
import {
  listLicences,
  getLicenceById,
  applyForLicence,
  updateStatus,
  licenceStats,
} from './controller'
import { protect } from '../../middleware/auth'

const router = Router()

// Public - No 'protect' here so dashboard loads immediately
router.get('/stats', licenceStats)
router.get('/',      listLicences)
router.get('/:id',   getLicenceById)

// Protected - Require login
router.post('/',            protect, applyForLicence)
router.patch('/:id/status', protect, updateStatus)

export default router
