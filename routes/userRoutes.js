// routes/userRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import { addSteps } from '../controllers/userController.js';

const router = express.Router();

router.use(protect);
router.post('/steps', protect, addSteps);

export default router;