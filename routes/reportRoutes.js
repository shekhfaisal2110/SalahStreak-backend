import express from 'express';
import { protect } from '../middleware/auth.js';
import { generateReport } from '../controllers/reportController.js';

const router = express.Router();

router.use(protect);
router.post('/generate', generateReport);

export default router;