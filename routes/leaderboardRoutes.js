// import express from 'express';
// import { protect } from '../middleware/auth.js';
// import {
//   getAllDaysCompletedLeaderboard,
//   getStreakLeaderboard,
//   getUserRank,
//   getTotalDhikrLeaderboard // import the new function
// } from '../controllers/leaderboardController.js';

// const router = express.Router();

// router.use(protect);

// router.get('/all-days-completed', getAllDaysCompletedLeaderboard);
// router.get('/streak', getStreakLeaderboard);
// router.get('/total-dhikr', getTotalDhikrLeaderboard); // new route
// router.get('/rank', getUserRank);

// export default router;





import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getAllDaysCompletedLeaderboard,
  getStreakLeaderboard,
  getTotalDhikrLeaderboard,
  getUserRank
} from '../controllers/leaderboardController.js';

const router = express.Router();

router.use(protect);

router.get('/all-days-completed', getAllDaysCompletedLeaderboard);
router.get('/streak', getStreakLeaderboard);
router.get('/total-dhikr', getTotalDhikrLeaderboard);
router.get('/rank', getUserRank);

export default router;