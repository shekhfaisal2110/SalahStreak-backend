import express from 'express';
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

router.use(protect);

router.post('/', createGroup);
router.get('/', getGroups);
router.get('/:id', getGroupById);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);
router.put('/:id/pin', togglePin);

export default router;