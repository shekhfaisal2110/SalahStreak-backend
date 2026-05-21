import express from 'express';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/adminMiddleware.js';
import { getAllNotifications, createNotification, deleteNotification } from '../controllers/notificationController.js';

const router = express.Router();
router.use(protect, isAdmin);

router.get('/notifications', getAllNotifications);
router.post('/notifications', createNotification);
router.delete('/notifications/:id', deleteNotification);

export default router;