import PrayerEntry from '../models/PrayerEntry.js';
import TasbeehDaily from '../models/TasbeehDaily.js';
import { generatePrayerReportPDF } from '../utils/pdfGenerator.js';
import { generateTasbeehDailyReportPDF } from '../utils/tasbeehPDFGenerator.js';
import { generateQuranReportPDF } from '../utils/pdfGeneratorQuran.js';
import QuranCompletion from '../models/QuranCompletion.js';
import TaskEntry from '../models/TaskEntry.js';
import { generateTaskReportPDF } from '../utils/pdfGeneratorTasks.js';

// Generate report based on date range
export const generateReport = async (req, res) => {
  try {
    const { startDate, endDate, period } = req.body; // period: week, month, year, all
    const userId = req.user._id;

    const query = { user: userId };
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const entries = await PrayerEntry.find(query).sort({ date: 1 });

    // Calculate stats
    const prayerCounts = { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
    const missedPrayers = { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
    let offered = 0, missed = 0;

    entries.forEach(entry => {
      ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(p => {
        if (entry.prayers[p]) {
          prayerCounts[p]++;
          offered++;
        } else {
          missedPrayers[p]++;
          missed++;
        }
      });
    });

    const totalDays = entries.length;
    const completionRate = totalDays ? ((offered / (totalDays * 5)) * 100).toFixed(1) : 0;
    const breakdown = Object.keys(prayerCounts).map(prayer => ({
      prayer,
      offered: prayerCounts[prayer],
      missed: missedPrayers[prayer],
      percentage: totalDays ? ((prayerCounts[prayer] / totalDays) * 100).toFixed(1) : 0,
    }));

    // Prepare daily entries for the PDF table
    const dailyEntries = entries.map(entry => ({
      date: entry.date,
      prayers: entry.prayers
    }));

    const pdfData = await generatePrayerReportPDF(
      { offered, missed, completionRate, breakdown, dailyEntries },
      period
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prayer-report-${period}.pdf`);
    res.send(pdfData);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const generateTasbeehDailyReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
    }

    const dailyTotals = await TasbeehDaily.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$date',
          total: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const pdfData = await generateTasbeehDailyReportPDF(dailyTotals, startDate, endDate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=tasbeeh-daily-report-${startDate}-to-${endDate}.pdf`);
    res.send(pdfData);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const generateQuranReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const query = { user: req.user._id };
    if (startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00.000Z');
      const end = new Date(endDate + 'T23:59:59.999Z');
      query.completedAt = { $gte: start, $lte: end };
    }
    const completions = await QuranCompletion.find(query).sort({ completedAt: 1 });

    const pdfData = await generateQuranReportPDF(completions, startDate, endDate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=quran-report.pdf`);
    res.send(pdfData);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateTaskReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const userId = req.user._id;

    // Build query for completed tasks in the date range
    const query = { user: userId, completed: true };
    if (startDate && endDate) {
      // Assuming `date` field is stored as YYYY-MM-DD string
      query.date = { $gte: startDate, $lte: endDate };
    }

    const completions = await TaskEntry.find(query)
      .populate('task', 'name scheduledTime')
      .sort({ date: 1 });

    // Format data for PDF
    const data = completions.map(entry => ({
      taskName: entry.task?.name || 'Unknown',
      completedAt: entry.date, // or use entry.completedAt if you have a separate timestamp
    }));

    const pdfData = await generateTaskReportPDF(data, startDate, endDate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=tasks-report.pdf`);
    res.send(pdfData);
  } catch (error) {
    console.error('Task report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};