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

// Public
router.get('/stats', licenceStats)
router.get('/',      listLicences)
router.get('/:id',   getLicenceById)

// Unprotected for demo
router.post('/',            applyForLicence)
router.patch('/:id/status', protect, updateStatus)

export default router
