import express from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  lookupIsbnController,
  getFeaturedBooks,
} from '../controllers/bookController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public OPAC catalog routes
router.get('/', getBooks);
router.get('/featured', getFeaturedBooks);
router.get('/isbn/:isbn', protect, authorize('admin', 'librarian'), lookupIsbnController);
router.get('/:id', getBookById);

// Staff / Admin catalog management
router.post('/', protect, authorize('admin', 'librarian'), createBook);
router.put('/:id', protect, authorize('admin', 'librarian'), updateBook);
router.delete('/:id', protect, authorize('admin', 'librarian'), deleteBook);

export default router;
