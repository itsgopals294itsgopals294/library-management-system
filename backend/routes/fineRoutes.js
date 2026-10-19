import express from 'express';
import { getFines, payFine, waiveFine } from '../controllers/fineController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getFines);
router.post('/:id/pay', protect, authorize('admin', 'librarian'), payFine);
router.post('/:id/waive', protect, authorize('admin', 'librarian'), waiveFine);

export default router;
