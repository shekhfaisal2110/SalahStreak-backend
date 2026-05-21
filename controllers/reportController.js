// // import PrayerEntry from '../models/PrayerEntry.js';
// // import TasbeehDaily from '../models/TasbeehDaily.js';
// // import { generatePrayerReportPDF } from '../utils/pdfGenerator.js';
// // import { generateTasbeehDailyReportPDF } from '../utils/tasbeehPDFGenerator.js';
// // import { generateQuranReportPDF } from '../utils/pdfGeneratorQuran.js';
// // import QuranCompletion from '../models/QuranCompletion.js';
// // import TaskEntry from '../models/TaskEntry.js';
// // import { generateTaskReportPDF } from '../utils/pdfGeneratorTasks.js';

// // // Generate report based on date range
// // export const generateReport = async (req, res) => {
// //   try {
// //     const { startDate, endDate, period } = req.body; // period: week, month, year, all
// //     const userId = req.user._id;

// //     const query = { user: userId };
// //     if (startDate && endDate) {
// //       query.date = { $gte: startDate, $lte: endDate };
// //     }

// //     const entries = await PrayerEntry.find(query).sort({ date: 1 });

// //     // Calculate stats
// //     const prayerCounts = { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
// //     const missedPrayers = { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
// //     let offered = 0, missed = 0;

// //     entries.forEach(entry => {
// //       ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(p => {
// //         if (entry.prayers[p]) {
// //           prayerCounts[p]++;
// //           offered++;
// //         } else {
// //           missedPrayers[p]++;
// //           missed++;
// //         }
// //       });
// //     });

// //     const totalDays = entries.length;
// //     const completionRate = totalDays ? ((offered / (totalDays * 5)) * 100).toFixed(1) : 0;
// //     const breakdown = Object.keys(prayerCounts).map(prayer => ({
// //       prayer,
// //       offered: prayerCounts[prayer],
// //       missed: missedPrayers[prayer],
// //       percentage: totalDays ? ((prayerCounts[prayer] / totalDays) * 100).toFixed(1) : 0,
// //     }));

// //     // Prepare daily entries for the PDF table
// //     const dailyEntries = entries.map(entry => ({
// //       date: entry.date,
// //       prayers: entry.prayers
// //     }));

// //     const pdfData = await generatePrayerReportPDF(
// //       { offered, missed, completionRate, breakdown, dailyEntries },
// //       period
// //     );

// //     res.setHeader('Content-Type', 'application/pdf');
// //     res.setHeader('Content-Disposition', `attachment; filename=prayer-report-${period}.pdf`);
// //     res.send(pdfData);
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };



// // export const generateTasbeehDailyReport = async (req, res) => {
// //   try {
// //     const { startDate, endDate } = req.body;
// //     if (!startDate || !endDate) {
// //       return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
// //     }

// //     const dailyTotals = await TasbeehDaily.aggregate([
// //       {
// //         $match: {
// //           user: req.user._id,
// //           date: { $gte: startDate, $lte: endDate }
// //         }
// //       },
// //       {
// //         $group: {
// //           _id: '$date',
// //           total: { $sum: '$count' }
// //         }
// //       },
// //       { $sort: { _id: 1 } }
// //     ]);

// //     const pdfData = await generateTasbeehDailyReportPDF(dailyTotals, startDate, endDate);

// //     res.setHeader('Content-Type', 'application/pdf');
// //     res.setHeader('Content-Disposition', `attachment; filename=tasbeeh-daily-report-${startDate}-to-${endDate}.pdf`);
// //     res.send(pdfData);
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };


// // export const generateQuranReport = async (req, res) => {
// //   try {
// //     const { startDate, endDate } = req.body;
// //     const query = { user: req.user._id };
// //     if (startDate && endDate) {
// //       const start = new Date(startDate + 'T00:00:00.000Z');
// //       const end = new Date(endDate + 'T23:59:59.999Z');
// //       query.completedAt = { $gte: start, $lte: end };
// //     }
// //     const completions = await QuranCompletion.find(query).sort({ completedAt: 1 });

// //     const pdfData = await generateQuranReportPDF(completions, startDate, endDate);

// //     res.setHeader('Content-Type', 'application/pdf');
// //     res.setHeader('Content-Disposition', `attachment; filename=quran-report.pdf`);
// //     res.send(pdfData);
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // export const generateTaskReport = async (req, res) => {
// //   try {
// //     const { startDate, endDate } = req.body;
// //     const userId = req.user._id;

// //     // Build query for completed tasks in the date range
// //     const query = { user: userId, completed: true };
// //     if (startDate && endDate) {
// //       // Assuming `date` field is stored as YYYY-MM-DD string
// //       query.date = { $gte: startDate, $lte: endDate };
// //     }

// //     const completions = await TaskEntry.find(query)
// //       .populate('task', 'name scheduledTime')
// //       .sort({ date: 1 });

// //     // Format data for PDF
// //     const data = completions.map(entry => ({
// //       taskName: entry.task?.name || 'Unknown',
// //       completedAt: entry.date, // or use entry.completedAt if you have a separate timestamp
// //     }));

// //     const pdfData = await generateTaskReportPDF(data, startDate, endDate);

// //     res.setHeader('Content-Type', 'application/pdf');
// //     res.setHeader('Content-Disposition', `attachment; filename=tasks-report.pdf`);
// //     res.send(pdfData);
// //   } catch (error) {
// //     console.error('Task report error:', error);
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };









// import PrayerEntry from '../models/PrayerEntry.js';
// import TasbeehDaily from '../models/TasbeehDaily.js';
// import { generatePrayerReportPDF } from '../utils/pdfGenerator.js';
// import { generateTasbeehDailyReportPDF } from '../utils/tasbeehPDFGenerator.js';
// import { generateQuranReportPDF } from '../utils/pdfGeneratorQuran.js';
// import QuranCompletion from '../models/QuranCompletion.js';
// import TaskEntry from '../models/TaskEntry.js';
// import { generateTaskReportPDF } from '../utils/pdfGeneratorTasks.js';

// // Helper: default date range (last 30 days)
// const getDefaultDateRange = () => {
//   const end = new Date();
//   const start = new Date();
//   start.setDate(start.getDate() - 30);
//   return {
//     startDate: start.toISOString().slice(0, 10),
//     endDate: end.toISOString().slice(0, 10)
//   };
// };

// // ✅ Generate prayer report with aggregation (fast, memory efficient)
// export const generateReport = async (req, res) => {
//   try {
//     let { startDate, endDate, period } = req.body;
//     if (!startDate || !endDate) {
//       const def = getDefaultDateRange();
//       startDate = def.startDate;
//       endDate = def.endDate;
//     }

//     const userId = req.user._id;
//     const matchStage = { user: userId, date: { $gte: startDate, $lte: endDate } };

//     // ✅ Aggregation to compute stats directly in DB
//     const [stats] = await PrayerEntry.aggregate([
//       { $match: matchStage },
//       {
//         $facet: {
//           totals: [
//             {
//               $group: {
//                 _id: null,
//                 daysCount: { $sum: 1 },
//                 offeredFajr: { $sum: { $cond: ['$prayers.Fajr', 1, 0] } },
//                 offeredDhuhr: { $sum: { $cond: ['$prayers.Dhuhr', 1, 0] } },
//                 offeredAsr: { $sum: { $cond: ['$prayers.Asr', 1, 0] } },
//                 offeredMaghrib: { $sum: { $cond: ['$prayers.Maghrib', 1, 0] } },
//                 offeredIsha: { $sum: { $cond: ['$prayers.Isha', 1, 0] } }
//               }
//             }
//           ],
//           dailyEntries: [
//             { $project: { date: 1, prayers: 1 } },
//             { $sort: { date: 1 } },
//             { $limit: 500 } // ✅ limit for PDF (max 500 days)
//           ]
//         }
//       }
//     ]);

//     const totals = stats.totals[0] || { daysCount: 0, offeredFajr: 0, offeredDhuhr: 0, offeredAsr: 0, offeredMaghrib: 0, offeredIsha: 0 };
//     const daysCount = totals.daysCount;
//     const offered = totals.offeredFajr + totals.offeredDhuhr + totals.offeredAsr + totals.offeredMaghrib + totals.offeredIsha;
//     const missed = (daysCount * 5) - offered;
//     const completionRate = daysCount ? ((offered / (daysCount * 5)) * 100).toFixed(1) : 0;

//     const prayerCounts = {
//       Fajr: totals.offeredFajr,
//       Dhuhr: totals.offeredDhuhr,
//       Asr: totals.offeredAsr,
//       Maghrib: totals.offeredMaghrib,
//       Isha: totals.offeredIsha
//     };
//     const missedPrayers = {
//       Fajr: daysCount - totals.offeredFajr,
//       Dhuhr: daysCount - totals.offeredDhuhr,
//       Asr: daysCount - totals.offeredAsr,
//       Maghrib: daysCount - totals.offeredMaghrib,
//       Isha: daysCount - totals.offeredIsha
//     };

//     const breakdown = Object.keys(prayerCounts).map(prayer => ({
//       prayer,
//       offered: prayerCounts[prayer],
//       missed: missedPrayers[prayer],
//       percentage: daysCount ? ((prayerCounts[prayer] / daysCount) * 100).toFixed(1) : 0
//     }));

//     const pdfData = await generatePrayerReportPDF(
//       { offered, missed, completionRate, breakdown, dailyEntries: stats.dailyEntries },
//       period || `${startDate}_to_${endDate}`
//     );

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=prayer-report-${startDate}-to-${endDate}.pdf`);
//     res.send(pdfData);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Tasbeeh daily report with limit & lean
// export const generateTasbeehDailyReport = async (req, res) => {
//   try {
//     let { startDate, endDate } = req.body;
//     if (!startDate || !endDate) {
//       const def = getDefaultDateRange();
//       startDate = def.startDate;
//       endDate = def.endDate;
//     }

//     const dailyTotals = await TasbeehDaily.aggregate([
//       {
//         $match: {
//           user: req.user._id,
//           date: { $gte: startDate, $lte: endDate }
//         }
//       },
//       {
//         $group: {
//           _id: '$date',
//           total: { $sum: '$count' }
//         }
//       },
//       { $sort: { _id: 1 } },
//       { $limit: 500 } // ✅ limit days
//     ]);

//     const pdfData = await generateTasbeehDailyReportPDF(dailyTotals, startDate, endDate);

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=tasbeeh-daily-report-${startDate}-to-${endDate}.pdf`);
//     res.send(pdfData);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Quran report with limit and lean
// export const generateQuranReport = async (req, res) => {
//   try {
//     let { startDate, endDate } = req.body;
//     const query = { user: req.user._id };
//     if (startDate && endDate) {
//       const start = new Date(startDate + 'T00:00:00.000Z');
//       const end = new Date(endDate + 'T23:59:59.999Z');
//       query.completedAt = { $gte: start, $lte: end };
//     } else {
//       // Default: last 100 completions
//       const completions = await QuranCompletion.find({ user: req.user._id })
//         .sort({ completedAt: -1 })
//         .limit(100)
//         .lean();
//       const pdfData = await generateQuranReportPDF(completions, null, null);
//       res.setHeader('Content-Type', 'application/pdf');
//       res.setHeader('Content-Disposition', `attachment; filename=quran-report-latest-100.pdf`);
//       return res.send(pdfData);
//     }

//     const completions = await QuranCompletion.find(query)
//       .sort({ completedAt: -1 })
//       .limit(200) // ✅ limit
//       .lean();

//     const pdfData = await generateQuranReportPDF(completions, startDate, endDate);
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=quran-report-${startDate}-to-${endDate}.pdf`);
//     res.send(pdfData);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Task report with lean, selective populate, and limit
// export const generateTaskReport = async (req, res) => {
//   try {
//     let { startDate, endDate } = req.body;
//     const userId = req.user._id;
//     const query = { user: userId, completed: true };
    
//     if (startDate && endDate) {
//       query.date = { $gte: startDate, $lte: endDate };
//     } else {
//       // Default: last 90 days
//       const end = new Date();
//       const start = new Date();
//       start.setDate(start.getDate() - 90);
//       query.date = {
//         $gte: start.toISOString().slice(0, 10),
//         $lte: end.toISOString().slice(0, 10)
//       };
//     }

//     const completions = await TaskEntry.find(query)
//       .populate('task', 'name scheduledTime') // ✅ only needed fields
//       .sort({ date: 1 })
//       .limit(1000) // ✅ limit for PDF
//       .lean();

//     const data = completions.map(entry => ({
//       taskName: entry.task?.name || 'Unknown',
//       completedAt: entry.date
//     }));

//     const pdfData = await generateTaskReportPDF(data, startDate, endDate);
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=tasks-report.pdf`);
//     res.send(pdfData);
//   } catch (error) {
//     console.error('Task report error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };













import PrayerEntry from '../models/PrayerEntry.js';
import TasbeehDaily from '../models/TasbeehDaily.js';
import { generatePrayerReportPDF } from '../utils/pdfGenerator.js';
import { generateTasbeehDailyReportPDF } from '../utils/tasbeehPDFGenerator.js';
import { generateQuranReportPDF } from '../utils/pdfGeneratorQuran.js';
import QuranCompletion from '../models/QuranCompletion.js';
import TaskEntry from '../models/TaskEntry.js';
import { generateTaskReportPDF } from '../utils/pdfGeneratorTasks.js';

// Helper: default date range (last 30 days)
const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10)
  };
};

// Generate prayer report with aggregation (single DB roundtrip, fast & memory efficient)
export const generateReport = async (req, res) => {
  try {
    let { startDate, endDate, period } = req.body;
    if (!startDate || !endDate) {
      const def = getDefaultDateRange();
      startDate = def.startDate;
      endDate = def.endDate;
    }

    const userId = req.user._id;
    const matchStage = { user: userId, date: { $gte: startDate, $lte: endDate } };

    // Aggregation pipeline – $facet does everything in one query
    const [stats] = await PrayerEntry.aggregate([
      { $match: matchStage },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                daysCount: { $sum: 1 },
                offeredFajr: { $sum: { $cond: ['$prayers.Fajr', 1, 0] } },
                offeredDhuhr: { $sum: { $cond: ['$prayers.Dhuhr', 1, 0] } },
                offeredAsr: { $sum: { $cond: ['$prayers.Asr', 1, 0] } },
                offeredMaghrib: { $sum: { $cond: ['$prayers.Maghrib', 1, 0] } },
                offeredIsha: { $sum: { $cond: ['$prayers.Isha', 1, 0] } }
              }
            }
          ],
          dailyEntries: [
            { $project: { date: 1, prayers: 1 } },
            { $sort: { date: 1 } },
            { $limit: 500 } // PDF table size limit
          ]
        }
      }
    ]);

    const totals = stats.totals[0] || { daysCount: 0, offeredFajr: 0, offeredDhuhr: 0, offeredAsr: 0, offeredMaghrib: 0, offeredIsha: 0 };
    const daysCount = totals.daysCount;
    const offered = totals.offeredFajr + totals.offeredDhuhr + totals.offeredAsr + totals.offeredMaghrib + totals.offeredIsha;
    const missed = (daysCount * 5) - offered;
    const completionRate = daysCount ? ((offered / (daysCount * 5)) * 100).toFixed(1) : 0;

    const prayerCounts = {
      Fajr: totals.offeredFajr,
      Dhuhr: totals.offeredDhuhr,
      Asr: totals.offeredAsr,
      Maghrib: totals.offeredMaghrib,
      Isha: totals.offeredIsha
    };
    const missedPrayers = {
      Fajr: daysCount - totals.offeredFajr,
      Dhuhr: daysCount - totals.offeredDhuhr,
      Asr: daysCount - totals.offeredAsr,
      Maghrib: daysCount - totals.offeredMaghrib,
      Isha: daysCount - totals.offeredIsha
    };

    const breakdown = Object.keys(prayerCounts).map(prayer => ({
      prayer,
      offered: prayerCounts[prayer],
      missed: missedPrayers[prayer],
      percentage: daysCount ? ((prayerCounts[prayer] / daysCount) * 100).toFixed(1) : 0
    }));

    const pdfData = await generatePrayerReportPDF(
      { offered, missed, completionRate, breakdown, dailyEntries: stats.dailyEntries },
      period || `${startDate}_to_${endDate}`
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prayer-report-${startDate}-to-${endDate}.pdf`);
    res.send(pdfData);
  } catch (error) {
    console.error('Prayer report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tasbeeh daily report – aggregation with limit
export const generateTasbeehDailyReport = async (req, res) => {
  try {
    let { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      const def = getDefaultDateRange();
      startDate = def.startDate;
      endDate = def.endDate;
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
      { $sort: { _id: 1 } },
      { $limit: 500 } // prevent huge PDF
    ]);

    const pdfData = await generateTasbeehDailyReportPDF(dailyTotals, startDate, endDate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=tasbeeh-daily-report-${startDate}-to-${endDate}.pdf`);
    res.send(pdfData);
  } catch (error) {
    console.error('Tasbeeh report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Quran report – with date range or fallback to latest 100 completions
export const generateQuranReport = async (req, res) => {
  try {
    let { startDate, endDate } = req.body;
    const query = { user: req.user._id };

    if (startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00.000Z');
      const end = new Date(endDate + 'T23:59:59.999Z');
      query.completedAt = { $gte: start, $lte: end };
      const completions = await QuranCompletion.find(query)
        .sort({ completedAt: -1 })
        .limit(200)
        .lean();
      const pdfData = await generateQuranReportPDF(completions, startDate, endDate);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=quran-report-${startDate}-to-${endDate}.pdf`);
      return res.send(pdfData);
    }

    // Default: last 100 completions
    const completions = await QuranCompletion.find({ user: req.user._id })
      .sort({ completedAt: -1 })
      .limit(100)
      .lean();
    const pdfData = await generateQuranReportPDF(completions, null, null);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=quran-report-latest-100.pdf');
    res.send(pdfData);
  } catch (error) {
    console.error('Quran report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Task report – lean, selective populate, and limit
export const generateTaskReport = async (req, res) => {
  try {
    let { startDate, endDate } = req.body;
    const userId = req.user._id;
    const query = { user: userId, completed: true };
    
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else {
      // Default: last 90 days
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 90);
      query.date = {
        $gte: start.toISOString().slice(0, 10),
        $lte: end.toISOString().slice(0, 10)
      };
    }

    const completions = await TaskEntry.find(query)
      .populate('task', 'name scheduledTime') // only needed fields
      .sort({ date: 1 })
      .limit(1000) // PDF limit
      .lean();

    const data = completions.map(entry => ({
      taskName: entry.task?.name || 'Unknown',
      completedAt: entry.date
    }));

    const pdfData = await generateTaskReportPDF(data, startDate, endDate);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=tasks-report-${startDate || 'latest'}.pdf`);
    res.send(pdfData);
  } catch (error) {
    console.error('Task report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};