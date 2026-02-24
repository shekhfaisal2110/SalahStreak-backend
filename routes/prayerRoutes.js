import express from 'express';
import { protect } from '../middleware/auth.js';
import { getPrayerBook, updatePrayer, getMonthlyStats, getTodayPrayers, updateTodayPrayers } from '../controllers/prayerController.js';

const router = express.Router();

router.use(protect);
router.get('/', getPrayerBook);
router.put('/update', updatePrayer);
router.get('/stats/:year/:month', getMonthlyStats);
router.get('/today', protect, getTodayPrayers);
router.put('/today', protect, updateTodayPrayers);

export default router;