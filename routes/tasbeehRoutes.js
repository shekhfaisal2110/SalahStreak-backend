// import express from 'express';
// import { protect } from '../middleware/auth.js';
// import { getTasbeehList, createTasbeeh, incrementTasbeeh,getDailyTotals, resetTasbeeh, deleteTasbeeh,updateTarget,togglePin,toggleShowCount,getDailyTotalsByDateRange, getTasbeehDailyCompletion } from '../controllers/tasbeehController.js';

// const router = express.Router();

// router.use(protect);
// router.get('/', getTasbeehList);
// router.post('/', createTasbeeh);
// router.put('/:id/increment', incrementTasbeeh);
// router.put('/:id/reset', resetTasbeeh);
// router.delete('/:id', deleteTasbeeh);
// router.put('/:id/target', protect, updateTarget);
// router.get('/daily-totals', protect, getDailyTotals);
// router.put('/:id/pin', protect, togglePin);
// router.put('/:id/show', protect, toggleShowCount);
// router.get('/daily-totals-range', protect, getDailyTotalsByDateRange);
// router.get('/:id/daily-completion', protect, getTasbeehDailyCompletion);

// export default router;




import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import { 
  getTasbeehList, 
  createTasbeeh, 
  incrementTasbeeh, 
  getDailyTotals, 
  resetTasbeeh, 
  deleteTasbeeh, 
  updateTarget, 
  togglePin, 
  toggleShowCount, 
  getDailyTotalsByDateRange, 
  getTasbeehDailyCompletion 
} from '../controllers/tasbeehController.js';

const router = express.Router();

// Rate limits
const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // 10 creations per minute
  message: { success: false, message: 'Too many tasbeeh creation attempts' },
});

const incrementLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,            // up to 120 increments per minute (2 per second) – allows fast tapping
  message: { success: false, message: 'Too many increment requests, slow down' },
});

const updateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many update requests' },
});

const deleteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many delete requests' },
});

// Cache helpers
const cacheShort = (req, res, next) => {
  res.setHeader('Cache-Control', 'private, max-age=5'); // 5 seconds (tasbeeh list can change often)
  next();
};
const cacheTotals = (req, res, next) => {
  res.setHeader('Cache-Control', 'private, max-age=30'); // 30 seconds (daily totals don't change that rapidly)
  next();
};
const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
};

// All routes require authentication
router.use(protect);

// Read endpoints with caching
router.get('/', cacheShort, getTasbeehList);
router.get('/daily-totals', cacheTotals, getDailyTotals);
router.get('/daily-totals-range', cacheTotals, getDailyTotalsByDateRange);
router.get('/:id/daily-completion', cacheShort, getTasbeehDailyCompletion);

// Write endpoints with rate limiting (and no cache)
router.post('/', createLimiter, noCache, createTasbeeh);
router.put('/:id/increment', incrementLimiter, noCache, incrementTasbeeh);
router.put('/:id/reset', updateLimiter, noCache, resetTasbeeh);
router.put('/:id/target', updateLimiter, noCache, updateTarget);
router.put('/:id/pin', updateLimiter, noCache, togglePin);
router.put('/:id/show', updateLimiter, noCache, toggleShowCount);
router.delete('/:id', deleteLimiter, noCache, deleteTasbeeh);

export default router;