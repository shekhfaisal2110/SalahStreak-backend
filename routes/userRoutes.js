// // routes/userRoutes.js
// import express from 'express';
// import { protect } from '../middleware/auth.js';
// import { addSteps, toggleShowRank} from '../controllers/userController.js';

// const router = express.Router();

// router.use(protect);
// router.post('/steps', protect, addSteps);
// router.put('/toggle-rank', protect, toggleShowRank);

// export default router;







import express from 'express';
import { protect } from '../middleware/auth.js';
import { addSteps, toggleShowRank } from '../controllers/userController.js';

const router = express.Router();

router.use(protect);
router.post('/steps', addSteps);
router.put('/toggle-rank', toggleShowRank);

export default router;