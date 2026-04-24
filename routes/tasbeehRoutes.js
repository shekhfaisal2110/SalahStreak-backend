import express from 'express';
import { protect } from '../middleware/auth.js';
import { getTasbeehList, createTasbeeh, incrementTasbeeh,getDailyTotals, resetTasbeeh, deleteTasbeeh,updateTarget,togglePin,toggleShowCount,getDailyTotalsByDateRange, getTasbeehDailyCompletion } from '../controllers/tasbeehController.js';

const router = express.Router();

router.use(protect);
router.get('/', getTasbeehList);
router.post('/', createTasbeeh);
router.put('/:id/increment', incrementTasbeeh);
router.put('/:id/reset', resetTasbeeh);
router.delete('/:id', deleteTasbeeh);
router.put('/:id/target', protect, updateTarget);
router.get('/daily-totals', protect, getDailyTotals);
router.put('/:id/pin', protect, togglePin);
router.put('/:id/show', protect, toggleShowCount);
router.get('/daily-totals-range', protect, getDailyTotalsByDateRange);
router.get('/:id/daily-completion', protect, getTasbeehDailyCompletion);

export default router;