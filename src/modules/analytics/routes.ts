import { Router } from 'express';
import { getDashboardStats } from './controller';

const router = Router();

// This will be accessible at /api/analytics/dashboard
router.get('/dashboard', getDashboardStats);

export default router;