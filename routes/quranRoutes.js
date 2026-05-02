// // import express from 'express';
// // import { protect } from '../middleware/auth.js';
// // import {
// //   getCurrentProgress,
// //   startNewProgress,
// //   markPara,
// //   getCompletions,
// //   getCompletionsByDateRange,
// // } from '../controllers/quranController.js';

// // const router = express.Router();

// // router.use(protect);

// // router.get('/progress', getCurrentProgress);
// // router.post('/start', startNewProgress);
// // router.put('/para/:para', markPara);
// // router.get('/completions', getCompletions);
// // router.get('/completions/range', getCompletionsByDateRange); // for report

// // export default router;



// import express from 'express';
// import { protect } from '../middleware/auth.js';
// import {
//   getCurrentProgress,
//   startNewProgress,
//   markPara,
//   getCompletions,
//   getCompletionsByDateRange,
// } from '../controllers/quranController.js';

// const router = express.Router();

// router.use(protect);

// router.get('/progress', getCurrentProgress);
// router.post('/start', startNewProgress);
// router.put('/para/:para', markPara);
// router.get('/completions', getCompletions);
// router.get('/completions/range', getCompletionsByDateRange); // for report

// export default router;




import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import {
  getCurrentProgress,
  startNewProgress,
  markPara,
  getCompletions,
  getCompletionsByDateRange,
} from '../controllers/quranController.js';

const router = express.Router();

// Rate limit for write operations
const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 write operations per minute
  message: { success: false, message: 'Too many requests, please slow down' },
});

// Stricter for marking many paras quickly (if user marks all 30 in one go, but natural usage is slower)
const paraLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // up to 30 para marks per minute (realistically user won't do that)
  message: { success: false, message: 'Too many para updates' },
});

// Cache helpers
const cacheShort = (req, res, next) => {
  res.setHeader('Cache-Control', 'private, max-age=15'); // 15 seconds (progress changes often)
  next();
};
const cacheHistory = (req, res, next) => {
  res.setHeader('Cache-Control', 'private, max-age=60'); // 1 minute (completions list)
  next();
};
const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
};

router.use(protect);

// Read endpoints with caching
router.get('/progress', cacheShort, getCurrentProgress);
router.get('/completions', cacheHistory, getCompletions);
router.get('/completions/range', noCache, getCompletionsByDateRange); // date range based – no cache

// Write endpoints with rate limiting
router.post('/start', writeLimiter, noCache, startNewProgress);
router.put('/para/:para', paraLimiter, noCache, markPara);

export default router;