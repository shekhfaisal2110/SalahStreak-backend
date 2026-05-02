// import express from 'express';
// import { protect } from '../middleware/auth.js';
// import { getPrayerBook, updatePrayer, getMonthlyStats, getTodayPrayers, updateTodayPrayers } from '../controllers/prayerController.js';

// const router = express.Router();

// router.use(protect);
// router.get('/', getPrayerBook);
// router.put('/update', updatePrayer);
// router.get('/stats/:year/:month', getMonthlyStats);
// router.get('/today', protect, getTodayPrayers);
// router.put('/today', protect, updateTodayPrayers);

// export default router;





import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import { getPrayerBook, updatePrayer, getMonthlyStats, getTodayPrayers, updateTodayPrayers } from '../controllers/prayerController.js';

const router = express.Router();

// Rate limit for write operations
const updateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 updates per minute (enough for normal usage)
  message: { success: false, message: 'Too many prayer updates, please slow down' },
});

// Cache headers helper
const cacheShort = (req, res, next) => {
  res.setHeader('Cache-Control', 'private, max-age=10'); // 10 seconds (prayer status changes often)
  next();
};
const cacheMonthly = (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour (monthly stats don't change)
  next();
};
const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
};

// Apply authentication to all routes below
router.use(protect);

// Read endpoints with caching
router.get('/', cacheShort, getPrayerBook);
router.get('/stats/:year/:month', cacheMonthly, getMonthlyStats);
router.get('/today', cacheShort, getTodayPrayers);

// Write endpoints with rate limiting (and no cache)
router.put('/update', updateLimiter, noCache, updatePrayer);
router.put('/today', updateLimiter, noCache, updateTodayPrayers);

export default router;