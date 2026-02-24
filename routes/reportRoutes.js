import express from 'express';
import { protect } from '../middleware/auth.js';
import { generateReport,generateTasbeehDailyReport } from '../controllers/reportController.js';

const router = express.Router();

router.use(protect);
router.post('/generate', generateReport);
router.post('/tasbeeh-daily', protect, generateTasbeehDailyReport);

export default router;