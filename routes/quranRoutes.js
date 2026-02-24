import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getCurrentProgress,
  startNewProgress,
  markPara,
  getCompletions,
  getCompletionsByDateRange,
} from '../controllers/quranController.js';

const router = express.Router();

router.use(protect);

router.get('/progress', getCurrentProgress);
router.post('/start', startNewProgress);
router.put('/para/:para', markPara);
router.get('/completions', getCompletions);
router.get('/completions/range', getCompletionsByDateRange); // for report

export default router;