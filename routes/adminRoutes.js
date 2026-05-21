import express from 'express';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/adminMiddleware.js';
import {
  getAllUsers,
  deleteUser,
  getPlatformStats,
  getAllPrayerGroups,
  deletePrayerGroup
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication + admin check
router.use(protect, isAdmin);

router.get('/users', getAllUsers);
router.delete('/users/:userId', deleteUser);
router.get('/stats', getPlatformStats);
router.get('/prayer-groups', getAllPrayerGroups);
router.delete('/prayer-groups/:groupId', deletePrayerGroup);

export default router;