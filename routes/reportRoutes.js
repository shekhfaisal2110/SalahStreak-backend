// import express from 'express';
// import { protect } from '../middleware/auth.js';
// import { generateReport,generateTasbeehDailyReport,generateQuranReport, generateTaskReport} from '../controllers/reportController.js';

// const router = express.Router();

// router.use(protect);
// router.post('/generate', generateReport);
// router.post('/tasbeeh-daily', protect, generateTasbeehDailyReport);
// router.post('/quran', protect, generateQuranReport);
// router.post('/tasks', protect, generateTaskReport);

// export default router;



import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import { generateReport, generateTasbeehDailyReport, generateQuranReport, generateTaskReport } from '../controllers/reportController.js';

const router = express.Router();

// ✅ Strict rate limiting for report generation (CPU intensive)
const reportLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,              // max 5 report requests per minute per user
  message: { success: false, message: 'Too many report requests, please wait a moment' },
});

// ✅ Even stricter for heavy reports (if needed)
const heavyReportLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  message: { success: false, message: 'Too many requests, please try again later' },
});

// Apply authentication to all routes
router.use(protect);

// All report endpoints use rate limiting
router.post('/generate', reportLimiter, generateReport);
router.post('/tasbeeh-daily', reportLimiter, generateTasbeehDailyReport);
router.post('/quran', heavyReportLimiter, generateQuranReport);
router.post('/tasks', reportLimiter, generateTaskReport);

export default router;