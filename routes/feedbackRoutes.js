import express from 'express';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/adminMiddleware.js';
import {
  submitFeedback,
  getUserFeedbacks,
  getAllFeedbacks,
  replyToFeedback,
  deleteFeedback
} from '../controllers/feedbackController.js';

const router = express.Router();

// User routes
router.use(protect);
router.post('/', submitFeedback);
router.get('/', getUserFeedbacks);

// Admin routes
router.get('/admin/all', protect, isAdmin, getAllFeedbacks);
router.put('/admin/:id/reply', protect, isAdmin, replyToFeedback);
router.delete('/admin/:id', protect, isAdmin, deleteFeedback);

export default router;