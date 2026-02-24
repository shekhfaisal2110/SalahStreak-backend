import express from 'express';
import { protect } from '../middleware/auth.js';
import { generateReport,generateTasbeehDailyReport,generateQuranReport, generateTaskReport} from '../controllers/reportController.js';

const router = express.Router();

router.use(protect);
router.post('/generate', generateReport);
router.post('/tasbeeh-daily', protect, generateTasbeehDailyReport);
router.post('/quran', protect, generateQuranReport);
router.post('/tasks', protect, generateTaskReport);

export default router;