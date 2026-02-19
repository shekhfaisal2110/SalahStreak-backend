import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import prayerRoutes from './routes/prayerRoutes.js';
import tasbeehRoutes from './routes/tasbeehRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import './utils/cronJobs.js'; // start cron jobs
import leaderboardRoutes from './routes/leaderboardRoutes.js';


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/prayerbook', prayerRoutes);
app.use('/api/tasbeeh', tasbeehRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/leaderboard', leaderboardRoutes);import PDFDocument from 'pdfkit';

export const generatePrayerReportPDF = (data, period) => {
  const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // ---------- Header ----------
    doc.fontSize(20).fillColor('#059669').text('Prayer Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#334155').text(`Period: ${period}`, { align: 'center' });
    doc.fontSize(10).fillColor('#64748b').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1.5);

    // ---------- Summary Stats ----------
    doc.fontSize(12).fillColor('#0f172a');
    doc.text(`Total Prayers Offered: ${data.offered}`);
    doc.text(`Total Prayers Missed: ${data.missed}`);
    doc.text(`Completion Rate: ${data.completionRate}%`);
    doc.moveDown(1);

    // ---------- Table Header ----------
    const tableTop = doc.y + 10;
    const colWidths = [100, 60, 60, 60, 60, 60];
    const headers = ['Date', 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    // Draw header background
    doc.fillColor('#e2e8f0').rect(doc.x, tableTop - 5, 550, 25).fill();
    doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold');

    let x = doc.x;
    headers.forEach((header, i) => {
      doc.text(header, x + 5, tableTop, { width: colWidths[i], align: 'center' });
      x += colWidths[i];
    });

    // ---------- Table Rows ----------
    let y = tableTop + 25;
    let rowCount = 0;

    if (!data.dailyEntries || data.dailyEntries.length === 0) {
      doc.fillColor('#64748b').fontSize(10).text('No prayer data available for the selected period.', doc.x, y + 10);
    } else {
      data.dailyEntries.forEach((entry) => {
        // Alternate row background
        if (rowCount % 2 === 0) {
          doc.fillColor('#f8fafc').rect(doc.x, y - 5, 550, 25).fill();
        }
        doc.fillColor('#0f172a').font('Helvetica').fontSize(10);

        x = doc.x;
        // Date column
        doc.text(entry.date, x + 5, y, { width: colWidths[0], align: 'center' });
        x += colWidths[0];

        // Prayer columns (✔ or ✘)
        const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        prayers.forEach((prayer, idx) => {
          const status = entry.prayers[prayer] ? '✔' : '✘';
          const color = entry.prayers[prayer] ? '#059669' : '#b91c1c';
          doc.fillColor(color).text(status, x + 5, y, { width: colWidths[idx + 1], align: 'center' });
          x += colWidths[idx + 1];
        });

        y += 25;
        rowCount++;
      });
    }

    // ---------- Footer ----------
    doc.fillColor('#94a3b8').fontSize(8).text(
      'May Allah accept your efforts.',
      doc.x,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();
  });
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? 'Loaded' : 'Missing');