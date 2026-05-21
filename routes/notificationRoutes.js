import express from 'express';
import { protect } from '../middleware/auth.js';
import { getUserNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';

const router = express.Router();
router.use(protect);

router.get('/', getUserNotifications);
router.put('/:notificationId/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;