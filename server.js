// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import connectDB from './config/db.js';
// import authRoutes from './routes/authRoutes.js';
// import prayerRoutes from './routes/prayerRoutes.js';
// import tasbeehRoutes from './routes/tasbeehRoutes.js';
// import reportRoutes from './routes/reportRoutes.js';
// import userRoutes from './routes/userRoutes.js';
// import './utils/cronJobs.js'; 
// import taskRoutes from './routes/taskRoutes.js';
// import quranRoutes from './routes/quranRoutes.js';
// import analyticsRoutes from './routes/analyticsRoutes.js';
// import prayerGroupRoutes from './routes/prayerGroupRoutes.js';


// dotenv.config();
// connectDB();

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.use('/api/auth', authRoutes);
// app.use('/api/prayerbook', prayerRoutes);
// app.use('/api/tasbeeh', tasbeehRoutes);
// app.use('/api/report', reportRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api/quran', quranRoutes); 
// app.use('/api/tasks', taskRoutes); 
// app.use('/api/analytics', analyticsRoutes);
// app.use('/api/prayer-groups', prayerGroupRoutes);

// export const generatePrayerReportPDF = (data, period) => {
//   const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
//   const buffers = [];

//   doc.on('data', buffers.push.bind(buffers));

//   return new Promise((resolve) => {
//     doc.on('end', () => {
//       const pdfData = Buffer.concat(buffers);
//       resolve(pdfData);
//     });

//     // ---------- Header ----------
//     doc.fontSize(20).fillColor('#059669').text('Prayer Report', { align: 'center' });
//     doc.moveDown(0.5);
//     doc.fontSize(14).fillColor('#334155').text(`Period: ${period}`, { align: 'center' });
//     doc.fontSize(10).fillColor('#64748b').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
//     doc.moveDown(1.5);

//     // ---------- Summary Stats ----------
//     doc.fontSize(12).fillColor('#0f172a');
//     doc.text(`Total Prayers Offered: ${data.offered}`);
//     doc.text(`Total Prayers Missed: ${data.missed}`);
//     doc.text(`Completion Rate: ${data.completionRate}%`);
//     doc.moveDown(1);

//     // ---------- Table Header ----------
//     const tableTop = doc.y + 10;
//     const colWidths = [100, 60, 60, 60, 60, 60];
//     const headers = ['Date', 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

//     // Draw header background
//     doc.fillColor('#e2e8f0').rect(doc.x, tableTop - 5, 550, 25).fill();
//     doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold');

//     let x = doc.x;
//     headers.forEach((header, i) => {
//       doc.text(header, x + 5, tableTop, { width: colWidths[i], align: 'center' });
//       x += colWidths[i];
//     });

//     // ---------- Table Rows ----------
//     let y = tableTop + 25;
//     let rowCount = 0;

//     if (!data.dailyEntries || data.dailyEntries.length === 0) {
//       doc.fillColor('#64748b').fontSize(10).text('No prayer data available for the selected period.', doc.x, y + 10);
//     } else {
//       data.dailyEntries.forEach((entry) => {
//         // Alternate row background
//         if (rowCount % 2 === 0) {
//           doc.fillColor('#f8fafc').rect(doc.x, y - 5, 550, 25).fill();
//         }
//         doc.fillColor('#0f172a').font('Helvetica').fontSize(10);

//         x = doc.x;
//         // Date column
//         doc.text(entry.date, x + 5, y, { width: colWidths[0], align: 'center' });
//         x += colWidths[0];

//         // Prayer columns (✔ or ✘)
//         const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
//         prayers.forEach((prayer, idx) => {
//           const status = entry.prayers[prayer] ? '✔' : '✘';
//           const color = entry.prayers[prayer] ? '#059669' : '#b91c1c';
//           doc.fillColor(color).text(status, x + 5, y, { width: colWidths[idx + 1], align: 'center' });
//           x += colWidths[idx + 1];
//         });

//         y += 25;
//         rowCount++;
//       });
//     }

//     // ---------- Footer ----------
//     doc.fillColor('#94a3b8').fontSize(8).text(
//       'May Allah accept your efforts.',
//       doc.x,
//       doc.page.height - 50,
//       { align: 'center' }
//     );

//     doc.end();
//   });
// };

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? 'Loaded' : 'Missing');












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

// ✅ Security middleware (with adjusted CSP for development)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// ✅ CORS configuration – allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',    // Vite default dev server
  'http://localhost:3000',    // React default
  'http://127.0.0.1:5173',
  'https://salah-streak.netlify.app',
  process.env.CLIENT_URL,      // Production URL (e.g., https://salah-streak.netlify.app)
].filter(Boolean);             // Remove undefined

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      // In development, allow all origins (optional, for easier testing)
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,            // Allow cookies/auth headers
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// ✅ Compression (gzip)
app.use(compression());

// ✅ Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// ✅ Body parser with size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ✅ Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ✅ API routes
app.use('/api/auth', authRoutes);
app.use('/api/prayerbook', prayerRoutes);
app.use('/api/tasbeeh', tasbeehRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/user', userRoutes);
app.use('/api/quran', quranRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/prayer-groups', prayerGroupRoutes);

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ✅ Global error handler
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