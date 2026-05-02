// import express from 'express';
// import { protect } from '../middleware/auth.js';
// import {
//   recordPageView,
//   recordEvent,
//   getAnalyticsSummary,
//   getDailyViewsByDateRange,
//   getDeviceBreakdown,
//   getUserTypes,
//   generateAnalyticsReport,
// } from '../controllers/analyticsController.js';

// const router = express.Router();

// router.use(protect);

// router.post('/pageview', recordPageView);
// router.post('/event', recordEvent);
// router.get('/summary', getAnalyticsSummary);
// router.get('/daily-views', getDailyViewsByDateRange);
// router.get('/devices', getDeviceBreakdown);
// router.get('/user-types', getUserTypes);
// router.get('/report', generateAnalyticsReport);

// export default router;




import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import {
  recordPageView,
  recordEvent,
  getAnalyticsSummary,
  getDailyViewsByDateRange,
  getDeviceBreakdown,
  getUserTypes,
  generateAnalyticsReport,
} from '../controllers/analyticsController.js';

const router = express.Router();

// ✅ Rate limit for POST requests (prevent abuse)
const postLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  message: { success: false, message: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Stricter limit for pageview (can be higher, but still safe)
const pageViewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many page view requests' },
});

// ❗ Note: `protect` middleware ensures user is authenticated
router.use(protect);

// POST routes with rate limiting
router.post('/pageview', pageViewLimiter, recordPageView);
router.post('/event', postLimiter, recordEvent);

// ✅ GET routes – add caching headers for better performance
const setCacheHeaders = (durationSeconds) => (req, res, next) => {
  res.setHeader('Cache-Control', `public, max-age=${durationSeconds}`);
  next();
};

router.get('/summary', setCacheHeaders(300), getAnalyticsSummary); // cache 5 min
router.get('/daily-views', setCacheHeaders(300), getDailyViewsByDateRange);
router.get('/devices', setCacheHeaders(600), getDeviceBreakdown); // cache 10 min (data changes slowly)
router.get('/user-types', setCacheHeaders(600), getUserTypes);
router.get('/report', setCacheHeaders(0), generateAnalyticsReport); // no cache (PDF reports)

export default router;