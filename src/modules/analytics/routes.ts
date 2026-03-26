// src/modules/analytics/routes.ts

import { Router } from 'express';
import { getDashboardStats, getComplaintsAnalytics } from './controller';

const router = Router();

// Existing
router.get('/dashboard', getDashboardStats);

// ✅ NEW (this powers your heatmap UI)
router.get('/complaints', getComplaintsAnalytics);

export default router;