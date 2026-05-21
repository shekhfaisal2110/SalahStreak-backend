// // import express from 'express';
// // import { protect } from '../middleware/auth.js';
// // import {
// //   createGroup,
// //   getGroups,
// //   getGroupById,
// //   updateGroup,
// //   deleteGroup,
// //   togglePin
// // } from '../controllers/prayerGroupController.js';

// // const router = express.Router();

// // router.use(protect);

// // router.post('/', createGroup);
// // router.get('/', getGroups);
// // router.get('/:id', getGroupById);
// // router.put('/:id', updateGroup);
// // router.delete('/:id', deleteGroup);
// // router.put('/:id/pin', togglePin);

// // export default router;






// import express from 'express';
// import rateLimit from 'express-rate-limit';
// import { protect } from '../middleware/auth.js';
// import {
//   createGroup,
//   getGroups,
//   getGroupById,
//   updateGroup,
//   deleteGroup,
//   togglePin
// } from '../controllers/prayerGroupController.js';

// const router = express.Router();

// // ✅ Rate limit for write operations
// const writeLimiter = rateLimit({
//   windowMs: 60 * 1000, // 1 minute
//   max: 10, // 10 requests per minute
//   message: { success: false, message: 'Too many requests, please slow down' },
// });

// // ✅ Stricter for delete
// const deleteLimiter = rateLimit({
//   windowMs: 60 * 1000,
//   max: 5,
//   message: { success: false, message: 'Too many delete attempts' },
// });

// // Cache control for GET endpoints (short TTL because groups may update)
// const cacheShort = (req, res, next) => {
//   res.setHeader('Cache-Control', 'public, max-age=30'); // 30 seconds
//   next();
// };
// const cacheNone = (req, res, next) => {
//   res.setHeader('Cache-Control', 'no-cache');
//   next();
// };

// router.use(protect);

// // Write operations with rate limiting
// router.post('/', writeLimiter, createGroup);
// router.put('/:id', writeLimiter, updateGroup);
// router.put('/:id/pin', writeLimiter, togglePin);
// router.delete('/:id', deleteLimiter, deleteGroup);

// // Read operations with caching (optional, based on how real-time you need)
// router.get('/', cacheShort, getGroups);
// router.get('/:id', cacheShort, getGroupById);

// export default router;














import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  togglePin
} from '../controllers/prayerGroupController.js';

const router = express.Router();

// ✅ Rate limit for write operations (prevent abuse)
const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: { success: false, message: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Stricter for delete operations
const deleteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many delete attempts' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Cache headers for GET endpoints (short TTL because groups may update)
const cacheShort = (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=30'); // 30 seconds
  next();
};

router.use(protect);

// Write operations with rate limiting
router.post('/', writeLimiter, createGroup);
router.put('/:id', writeLimiter, updateGroup);
router.put('/:id/pin', writeLimiter, togglePin);
router.delete('/:id', deleteLimiter, deleteGroup);

// Read operations with short caching (reduces DB load)
router.get('/', cacheShort, getGroups);
router.get('/:id', cacheShort, getGroupById);

export default router;