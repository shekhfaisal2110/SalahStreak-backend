// import express from 'express';
// import { protect } from '../middleware/auth.js';
// import { addSteps, toggleShowRank } from '../controllers/userController.js';

// const router = express.Router();

// router.use(protect);
// router.post('/steps', addSteps);
// router.put('/toggle-rank', toggleShowRank);

// export default router;



import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import { addSteps, toggleShowRank } from '../controllers/userController.js';

const router = express.Router();

// Rate limit for adding steps (prevent fake step inflation)
const stepsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // max 10 step additions per minute
  message: { success: false, message: 'Too many step additions, slow down' },
});

// Rate limit toggling rank (low traffic, but still protect)
const toggleLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many toggle requests' },
});

// No cache needed for writes

router.use(protect);

router.post('/steps', stepsLimiter, addSteps);
router.put('/toggle-rank', toggleLimiter, toggleShowRank);

export default router;