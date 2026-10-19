import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'librarian'), getUsers);
router.get('/:id', protect, authorize('admin', 'librarian'), getUserById);
router.put('/:id', protect, authorize('admin', 'librarian'), updateUser);
router.patch('/:id/toggle-status', protect, authorize('admin'), toggleUserStatus);

export default router;
