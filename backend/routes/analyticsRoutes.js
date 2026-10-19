import express from 'express';
import { getDashboardAnalytics, getAuditLogs } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, authorize('admin', 'librarian'), getDashboardAnalytics);
router.get('/audit-logs', protect, authorize('admin'), getAuditLogs);

export default router;
