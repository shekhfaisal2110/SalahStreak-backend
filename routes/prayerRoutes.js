import express from 'express';
import { protect } from '../middleware/auth.js';
import { getPrayerBook, updatePrayer, getMonthlyStats } from '../controllers/prayerController.js';

const router = express.Router();

router.use(protect);
router.get('/', getPrayerBook);
router.put('/update', updatePrayer);
router.get('/stats/:year/:month', getMonthlyStats);

export default router;