import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getEntriesForMonth,
  toggleEntry,
  getTaskStats,
  getTasksWithEntries,
  getAllCompletions,
  getEntriesForYear,
} from '../controllers/taskController.js';

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

router.get('/overview', getTasksWithEntries);
router.get('/completions', getAllCompletions);
router.get('/:taskId/entries', getEntriesForMonth);
router.put('/:taskId/entries/:date', toggleEntry);
router.get('/:taskId/stats', getTaskStats);
router.get('/:taskId/year-entries', protect, getEntriesForYear);

export default router;