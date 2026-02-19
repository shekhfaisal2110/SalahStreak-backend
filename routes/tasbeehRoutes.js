import express from 'express';
import { protect } from '../middleware/auth.js';
import { getTasbeehList, createTasbeeh, incrementTasbeeh, resetTasbeeh, deleteTasbeeh,updateTarget } from '../controllers/tasbeehController.js';

const router = express.Router();

router.use(protect);
router.get('/', getTasbeehList);
router.post('/', createTasbeeh);
router.put('/:id/increment', incrementTasbeeh);
router.put('/:id/reset', resetTasbeeh);
router.delete('/:id', deleteTasbeeh);
router.put('/:id/target', protect, updateTarget);

export default router;