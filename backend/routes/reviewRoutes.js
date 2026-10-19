import express from 'express';
import { addReview, getBookReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/book/:bookId', getBookReviews);
router.post('/book/:bookId', protect, addReview);

export default router;
