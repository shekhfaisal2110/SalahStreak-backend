// import express from 'express';
// import { protect } from '../middleware/auth.js';
// import {
//   getTasks,
//   createTask,
//   updateTask,
//   deleteTask,
//   getEntriesForMonth,
//   toggleEntry,
//   getTaskStats,
//   getTasksWithEntries,
//   getAllCompletions,
//   getEntriesForYear,
// } from '../controllers/taskController.js';

// const router = express.Router();

// router.use(protect);

// router.get('/', getTasks);
// router.post('/', createTask);
// router.put('/:id', updateTask);
// router.delete('/:id', deleteTask);

// router.get('/overview', getTasksWithEntries);
// router.get('/completions', getAllCompletions);
// router.get('/:taskId/entries', getEntriesForMonth);
// router.put('/:taskId/entries/:date', toggleEntry);
// router.get('/:taskId/stats', getTaskStats);
// router.get('/:taskId/year-entries', protect, getEntriesForYear);

// export default router;


import express from 'express';
import rateLimit from 'express-rate-limit';
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

// Rate limits
const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 tasks created per minute
  message: { success: false, message: 'Too many task creation attempts' },
});

const updateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many task update requests' },
});

const deleteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many delete requests' },
});

const toggleLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60, // up to 60 toggles per minute (1 per second) – reasonable for task logging
  message: { success: false, message: 'Too many toggle requests, slow down' },
});

// Cache helpers (optional)
const cacheShort = (req, res, next) => {
  res.setHeader('Cache-Control', 'private, max-age=10'); // 10 seconds
  next();
};
const cacheOverview = (req, res, next) => {
  res.setHeader('Cache-Control', 'private, max-age=30'); // 30 seconds for overview which aggregates many tasks
  next();
};
const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
};

// Authentication for all routes below
router.use(protect);

// Read operations with caching (short TTL because tasks can change)
router.get('/', cacheShort, getTasks);
router.get('/overview', cacheOverview, getTasksWithEntries);
router.get('/completions', cacheShort, getAllCompletions);

// Read operations that are query/date dependent – no cache
router.get('/:taskId/entries', noCache, getEntriesForMonth);
router.get('/:taskId/stats', noCache, getTaskStats);
router.get('/:taskId/year-entries', noCache, getEntriesForYear); // remove duplicate protect

// Write operations with rate limiting and no cache
router.post('/', createLimiter, noCache, createTask);
router.put('/:id', updateLimiter, noCache, updateTask);
router.delete('/:id', deleteLimiter, noCache, deleteTask);
router.put('/:taskId/entries/:date', toggleEntry);


export default router;