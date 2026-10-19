import express from 'express';
import {
  getCopiesByBook,
  getCopyByBarcode,
  addCopy,
  updateCopy,
  deleteCopy,
} from '../controllers/copyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/barcode/:barcode', protect, getCopyByBarcode);
router.get('/book/:bookId', protect, getCopiesByBook);
router.post('/book/:bookId', protect, authorize('admin', 'librarian'), addCopy);
router.put('/:id', protect, authorize('admin', 'librarian'), updateCopy);
router.delete('/:id', protect, authorize('admin', 'librarian'), deleteCopy);

export default router;
