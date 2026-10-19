import express from 'express';
import {
  createReservation,
  cancelReservation,
  getReservations,
} from '../controllers/reservationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createReservation);
router.get('/', protect, getReservations);
router.delete('/:id', protect, cancelReservation);

export default router;
