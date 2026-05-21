import express from 'express';
import { protect } from '../middleware/auth.js';
import { createGoal, getUserGoals, deleteGoal, getUserBadges, updateGoal } from '../controllers/goalController.js';

const router = express.Router();
router.use(protect);

router.get('/', getUserGoals);
router.post('/', createGoal);
router.delete('/:id', deleteGoal);
router.get('/badges', getUserBadges);
router.put('/:id', updateGoal);

export default router;