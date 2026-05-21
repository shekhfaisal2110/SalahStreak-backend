// // import express from 'express';
// // import { register, verifyOtp, login, forgotPassword, resetPassword, getMe, loginWithKey } from '../controllers/authController.js';
// // import { protect } from '../middleware/auth.js';

// // const router = express.Router();

// // router.post('/register', register);
// // router.post('/verify-otp', verifyOtp);
// // router.post('/login', login);
// // router.post('/forgot-password', forgotPassword);
// // router.post('/reset-password', resetPassword);
// // router.get('/me', protect, getMe);
// // router.post('/login/key', loginWithKey);

// // export default router;




// import express from 'express';
// import rateLimit from 'express-rate-limit';
// import { register, verifyOtp, login, forgotPassword, resetPassword, getMe, loginWithKey } from '../controllers/authController.js';
// import { protect } from '../middleware/auth.js';

// const router = express.Router();

// // ✅ Strict rate limit for auth endpoints (prevent brute force)
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // 10 attempts per window
//   message: { success: false, message: 'Too many attempts, please try again later' },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // ✅ Even stricter for login (optional but good)
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5,
//   message: { success: false, message: 'Too many login attempts, try again later' },
// });

// // ✅ Registration limit per IP (optional)
// const registerLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 3, // 3 registrations per IP per hour
//   message: { success: false, message: 'Too many registrations from this IP' },
// });

// // Public routes with rate limiting
// router.post('/register', registerLimiter, register);
// router.post('/verify-otp', authLimiter, verifyOtp);
// router.post('/login', loginLimiter, login);
// router.post('/forgot-password', authLimiter, forgotPassword);
// router.post('/reset-password', authLimiter, resetPassword);
// router.post('/login/key', loginLimiter, loginWithKey);

// // Protected route (no rate limit needed for /me, as it requires valid token)
// router.get('/me', protect, getMe);

// export default router;













import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, verifyOtp, login, forgotPassword, resetPassword, getMe, loginWithKey } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ✅ Strict rate limit for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { success: false, message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Even stricter for login (optional but good)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts, try again later' },
});

// ✅ Registration limit per IP (optional)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per IP per hour
  message: { success: false, message: 'Too many registrations from this IP' },
});

// Public routes with rate limiting
router.post('/register', registerLimiter, register);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/login', loginLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/login/key', loginLimiter, loginWithKey);

// Protected route (no rate limit needed for /me, as it requires valid token)
router.get('/me', protect, getMe);

export default router;