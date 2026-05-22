import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import prayerRoutes from './routes/prayerRoutes.js';
import tasbeehRoutes from './routes/tasbeehRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import userRoutes from './routes/userRoutes.js';
import './utils/cronJobs.js';
import taskRoutes from './routes/taskRoutes.js';
import quranRoutes from './routes/quranRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import prayerGroupRoutes from './routes/prayerGroupRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminNotificationsRoutes from './routes/adminNotificationsRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

dotenv.config();

// Validate critical environment variables
const requiredEnv = ['JWT_SECRET', 'BREVO_API_KEY', 'MONGO_URI'];
for (const env of requiredEnv) {
  if (!process.env[env]) {
    console.error(`❌ Missing required environment variable: ${env}`);
    process.exit(1);
  }
}

connectDB();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'https://salah-streak.netlify.app',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(compression());

// ✅ Global rate limiting – increased limit, skip /me endpoint
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,                // ← increased from 200 to 1000
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/auth/me', // ← no limit for /me
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/prayerbook', prayerRoutes);
app.use('/api/tasbeeh', tasbeehRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/user', userRoutes);
app.use('/api/quran', quranRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/prayer-groups', prayerGroupRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminNotificationsRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/feedback', feedbackRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📧 BREVO_API_KEY: ${process.env.BREVO_API_KEY ? 'Loaded' : 'Missing'}`);
  console.log(`🔐 JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Missing'}`);
  console.log(`🌐 CORS allowed origins: ${allowedOrigins.join(', ')}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      const mongoose = await import('mongoose');
      await mongoose.disconnect();
      console.log('MongoDB disconnected.');
    } catch (err) {
      console.error('Error disconnecting MongoDB:', err);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);