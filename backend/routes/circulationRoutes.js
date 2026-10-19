import express from 'express';
import {
  issueBook,
  returnBook,
  renewBook,
  getActiveLoans,
  getMemberLoans,
} from '../controllers/circulationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Librarian desk operations
router.post('/issue', protect, authorize('admin', 'librarian'), issueBook);
router.post('/return', protect, authorize('admin', 'librarian'), returnBook);
router.get('/active', protect, authorize('admin', 'librarian'), getActiveLoans);

// Renewals and Member loans
router.post('/:id/renew', protect, renewBook);
router.get('/my-loans', protect, getMemberLoans);
router.get('/member/:memberId', protect, authorize('admin', 'librarian'), getMemberLoans);

export default router;
