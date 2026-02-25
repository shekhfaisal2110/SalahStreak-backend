// // // import express from 'express';
// // // import { protect } from '../middleware/auth.js';
// // // import {
// // //   recordPageView,
// // //   recordEvent,
// // //   getAnalyticsSummary,
// // // } from '../controllers/analyticsController.js';

// // // const router = express.Router();

// // // router.use(protect); // All analytics endpoints require login

// // // router.post('/pageview', recordPageView);
// // // router.post('/event', recordEvent);
// // // router.get('/summary', getAnalyticsSummary);

// // // export default router;







// // import express from 'express';
// // import { protect } from '../middleware/auth.js';
// // import {
// //   recordPageView,
// //   recordEvent,
// //   getAnalyticsSummary,
// //   getDailyViewsByDateRange,
// //   generateAnalyticsReport,
// // } from '../controllers/analyticsController.js';

// // const router = express.Router();

// // router.use(protect);

// // router.post('/pageview', recordPageView);
// // router.post('/event', recordEvent);        
// // router.get('/summary', getAnalyticsSummary);
// // router.get('/daily-views', protect, getDailyViewsByDateRange);
// // router.get('/report', protect, generateAnalyticsReport);

// // export default router;





// import express from 'express';
// import { protect } from '../middleware/auth.js';
// import {
//   recordPageView,
//   recordEvent,
//   getAnalyticsSummary,
//   getDailyViewsByDateRange,
//   getDeviceBreakdown,
//   getUserTypes,
//   generateAnalyticsReport,
// } from '../controllers/analyticsController.js';

// const router = express.Router();

// router.use(protect); // all routes require authentication

// router.post('/pageview', recordPageView);
// router.post('/event', recordEvent);
// router.get('/summary', getAnalyticsSummary);
// router.get('/daily-views', getDailyViewsByDateRange);
// router.get('/devices', getDeviceBreakdown);
// router.get('/user-types', getUserTypes);
// router.get('/report', generateAnalyticsReport); // as defined earlier

// export default router;

import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  recordPageView,
  recordEvent,
  getAnalyticsSummary,
  getDailyViewsByDateRange,
  getDeviceBreakdown,
  getUserTypes,
  generateAnalyticsReport,
} from '../controllers/analyticsController.js';

const router = express.Router();

router.use(protect);

router.post('/pageview', recordPageView);
router.post('/event', recordEvent);
router.get('/summary', getAnalyticsSummary);
router.get('/daily-views', getDailyViewsByDateRange);
router.get('/devices', getDeviceBreakdown);
router.get('/user-types', getUserTypes);
router.get('/report', generateAnalyticsReport);

export default router;