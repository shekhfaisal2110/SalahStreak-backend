// import PrayerEntry from '../models/PrayerEntry.js';
// import User from '../models/User.js';

// // ✅ Ensure indexes in schema:
// // - { user: 1, date: 1 } unique
// // - { user: 1, date: -1 } for sorting
// // - { user: 1, createdAt: -1 } for pagination (if needed)

// // Get all entries for user with pagination
// export const getPrayerBook = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 30;
//     const skip = (page - 1) * limit;

//     const [entries, totalCount] = await Promise.all([
//       PrayerEntry.find({ user: req.user._id })
//         .sort({ date: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(), // ✅ plain JS objects
//       PrayerEntry.countDocuments({ user: req.user._id })
//     ]);

//     res.json({
//       success: true,
//       data: {
//         entries,
//         streak: req.user.streak,
//         pagination: {
//           page,
//           limit,
//           total: totalCount,
//           pages: Math.ceil(totalCount / limit)
//         }
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Update a prayer for a specific date (atomic)
// export const updatePrayer = async (req, res) => {
//   try {
//     const { date, prayer, value } = req.body;
//     const userId = req.user._id;
//     const today = new Date().toISOString().split('T')[0];

//     // ✅ Atomic upsert: update specific prayer field
//     const update = { $set: { [`prayers.${prayer}`]: value } };
//     const entry = await PrayerEntry.findOneAndUpdate(
//       { user: userId, date },
//       update,
//       { upsert: true, new: true, lean: true }
//     );

//     let newStreak = req.user.streak;

//     // Streak update logic (only for today and if all prayers completed)
//     if (date === today) {
//       const allOffered = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].every(p => entry.prayers[p] === true);
      
//       if (allOffered) {
//         // Fetch user only once and atomically update streak if needed
//         const user = await User.findById(userId);
//         const lastDate = user.lastPrayerDate ? user.lastPrayerDate.toISOString().split('T')[0] : null;
//         const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
//         if (lastDate === yesterday) {
//           newStreak = user.streak + 1;
//         } else if (lastDate !== today) {
//           newStreak = 1;
//         } else {
//           newStreak = user.streak; // already counted today
//         }
        
//         if (newStreak !== user.streak) {
//           await User.updateOne(
//             { _id: userId },
//             { $set: { streak: newStreak, lastPrayerDate: new Date() } }
//           );
//           req.user.streak = newStreak;
//         }
//       }
//     }

//     res.json({ success: true, data: { streak: newStreak } });
//   } catch (error) {
//     console.error('Update prayer error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get stats for a specific month/year using aggregation (fast)
// export const getMonthlyStats = async (req, res) => {
//   try {
//     const { year, month } = req.params;
//     const startDate = `${year}-${month.padStart(2, '0')}-01`;
//     const lastDay = new Date(year, month, 0).getDate();
//     const endDate = `${year}-${month.padStart(2, '0')}-${lastDay}`;
//     const userId = req.user._id;

//     const [result] = await PrayerEntry.aggregate([
//       { $match: { user: userId, date: { $gte: startDate, $lte: endDate } } },
//       {
//         $facet: {
//           totals: [
//             {
//               $group: {
//                 _id: null,
//                 totalOffered: {
//                   $sum: {
//                     $add: [
//                       { $cond: ['$prayers.Fajr', 1, 0] },
//                       { $cond: ['$prayers.Dhuhr', 1, 0] },
//                       { $cond: ['$prayers.Asr', 1, 0] },
//                       { $cond: ['$prayers.Maghrib', 1, 0] },
//                       { $cond: ['$prayers.Isha', 1, 0] }
//                     ]
//                   }
//                 },
//                 daysCount: { $sum: 1 },
//                 prayerCounts: {
//                   $sum: {
//                     Fajr: { $cond: ['$prayers.Fajr', 1, 0] },
//                     Dhuhr: { $cond: ['$prayers.Dhuhr', 1, 0] },
//                     Asr: { $cond: ['$prayers.Asr', 1, 0] },
//                     Maghrib: { $cond: ['$prayers.Maghrib', 1, 0] },
//                     Isha: { $cond: ['$prayers.Isha', 1, 0] }
//                   }
//                 }
//               }
//             }
//           ],
//           dailySums: [
//             {
//               $project: {
//                 date: 1,
//                 dailyTotal: {
//                   $add: [
//                     { $cond: ['$prayers.Fajr', 1, 0] },
//                     { $cond: ['$prayers.Dhuhr', 1, 0] },
//                     { $cond: ['$prayers.Asr', 1, 0] },
//                     { $cond: ['$prayers.Maghrib', 1, 0] },
//                     { $cond: ['$prayers.Isha', 1, 0] }
//                   ]
//                 }
//               }
//             },
//             { $sort: { dailyTotal: -1 } },
//             { $limit: 1 },
//             { $project: { bestDay: '$date', maxTotal: '$dailyTotal' } }
//           ]
//         }
//       }
//     ]);

//     if (!result.totals.length || result.totals[0].daysCount === 0) {
//       return res.json({
//         success: true,
//         data: {
//           offered: 0,
//           missed: 0,
//           completionRate: 0,
//           totalDays: 0,
//           mostOffered: '-',
//           mostMissed: '-',
//           bestDay: null,
//           prayerCounts: { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 },
//           missedPrayers: { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 }
//         }
//       });
//     }

//     const totals = result.totals[0];
//     const totalPrayers = totals.daysCount * 5;
//     const offered = totals.totalOffered;
//     const missed = totalPrayers - offered;
//     const completionRate = totalPrayers ? ((offered / totalPrayers) * 100).toFixed(1) : 0;
//     const prayerCounts = totals.prayerCounts;
//     const missedPrayers = {
//       Fajr: totals.daysCount - prayerCounts.Fajr,
//       Dhuhr: totals.daysCount - prayerCounts.Dhuhr,
//       Asr: totals.daysCount - prayerCounts.Asr,
//       Maghrib: totals.daysCount - prayerCounts.Maghrib,
//       Isha: totals.daysCount - prayerCounts.Isha
//     };

//     const mostOffered = Object.keys(prayerCounts).reduce((a, b) => prayerCounts[a] > prayerCounts[b] ? a : b, 'Fajr');
//     const mostMissed = Object.keys(missedPrayers).reduce((a, b) => missedPrayers[a] > missedPrayers[b] ? a : b, 'Fajr');
//     const bestDay = result.dailySums[0]?.bestDay || null;

//     res.json({
//       success: true,
//       data: {
//         offered,
//         missed,
//         completionRate,
//         totalDays: totals.daysCount,
//         mostOffered: prayerCounts[mostOffered] > 0 ? mostOffered : '-',
//         mostMissed: missedPrayers[mostMissed] > 0 ? mostMissed : '-',
//         bestDay,
//         prayerCounts,
//         missedPrayers
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get today's prayers (atomic upsert + lean)
// export const getTodayPrayers = async (req, res) => {
//   try {
//     const today = new Date().toISOString().split('T')[0];
//     const defaultPrayers = { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };
    
//     const entry = await PrayerEntry.findOneAndUpdate(
//       { user: req.user._id, date: today },
//       { $setOnInsert: { prayers: defaultPrayers } },
//       { upsert: true, new: true, lean: true }
//     );
    
//     res.json(entry.prayers);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// };

// // Update today's prayers (bulk update)
// export const updateTodayPrayers = async (req, res) => {
//   try {
//     const today = new Date().toISOString().split('T')[0];
//     const updates = req.body;
//     const entry = await PrayerEntry.findOneAndUpdate(
//       { user: req.user._id, date: today },
//       { $set: { prayers: updates } },
//       { new: true, upsert: true, lean: true }
//     );
//     res.json(entry.prayers);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// };












import PrayerEntry from '../models/PrayerEntry.js';
import User from '../models/User.js';

const getTodayStr = () => new Date().toISOString().split('T')[0];

export const getPrayerBook = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    const [entries, totalCount] = await Promise.all([
      PrayerEntry.find({ user: req.user._id }).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      PrayerEntry.countDocuments({ user: req.user._id })
    ]);
    res.json({
      success: true,
      data: {
        entries,
        streak: req.user.streak,
        pagination: { page, limit, total: totalCount, pages: Math.ceil(totalCount / limit) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePrayer = async (req, res) => {
  try {
    const { date, prayer, value } = req.body;
    const userId = req.user._id;
    const today = getTodayStr();
    const update = { $set: { [`prayers.${prayer}`]: value } };
    const entry = await PrayerEntry.findOneAndUpdate(
      { user: userId, date },
      update,
      { upsert: true, new: true, lean: true }
    );
    let newStreak = req.user.streak;
    if (date === today) {
      const allOffered = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].every(p => entry.prayers[p] === true);
      if (allOffered) {
        const user = await User.findById(userId).lean();
        const lastDate = user.lastPrayerDate ? user.lastPrayerDate.toISOString().split('T')[0] : null;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (lastDate === yesterday) newStreak = user.streak + 1;
        else if (lastDate !== today) newStreak = 1;
        else newStreak = user.streak;
        if (newStreak !== user.streak) {
          await User.updateOne({ _id: userId }, { $set: { streak: newStreak, lastPrayerDate: new Date() } });
          req.user.streak = newStreak;
        }
      }
    }
    res.json({ success: true, data: { streak: newStreak } });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ ULTIMATE FIX – simple loop, guaranteed correct object structure
export const getMonthlyStats = async (req, res) => {
  try {
    const { year, month } = req.params;
    const userId = req.user._id;

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    const totalDays = endDate.getDate();

    // Fetch all entries for this month
    const entries = await PrayerEntry.find({
      user: userId,
      date: { $gte: startStr, $lte: endStr }
    }).lean();

    // Map date -> prayers
    const entryMap = new Map();
    entries.forEach(entry => entryMap.set(entry.date, entry.prayers));

    // Initialize counters
    let totalOffered = 0;
    const prayerOffered = { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
    let bestDayDate = null;
    let bestDayCount = 0;

    // Loop day by day
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const prayers = entryMap.get(dateStr);
      let dayOffered = 0;

      if (prayers) {
        if (prayers.Fajr) { totalOffered++; prayerOffered.Fajr++; dayOffered++; }
        if (prayers.Dhuhr) { totalOffered++; prayerOffered.Dhuhr++; dayOffered++; }
        if (prayers.Asr) { totalOffered++; prayerOffered.Asr++; dayOffered++; }
        if (prayers.Maghrib) { totalOffered++; prayerOffered.Maghrib++; dayOffered++; }
        if (prayers.Isha) { totalOffered++; prayerOffered.Isha++; dayOffered++; }
      }

      if (dayOffered > bestDayCount) {
        bestDayCount = dayOffered;
        bestDayDate = dateStr;
      }
    }

    const totalPossible = totalDays * 5;
    const totalMissed = totalPossible - totalOffered;
    const completionRate = totalPossible ? ((totalOffered / totalPossible) * 100).toFixed(1) : 0;

    // Find most offered
    let mostOffered = '-';
    let maxOffered = 0;
    for (const [p, c] of Object.entries(prayerOffered)) {
      if (c > maxOffered) { maxOffered = c; mostOffered = p; }
    }

    // Find most missed
    let mostMissed = '-';
    let maxMissed = 0;
    for (const [p, c] of Object.entries(prayerOffered)) {
      const missed = totalDays - c;
      if (missed > maxMissed) { maxMissed = missed; mostMissed = p; }
    }

    // Missed per prayer
    const missedPrayers = {
      Fajr: totalDays - prayerOffered.Fajr,
      Dhuhr: totalDays - prayerOffered.Dhuhr,
      Asr: totalDays - prayerOffered.Asr,
      Maghrib: totalDays - prayerOffered.Maghrib,
      Isha: totalDays - prayerOffered.Isha
    };

    // Debug log to see what we're sending
    console.log('📊 Monthly stats calculated:', {
      offered: totalOffered,
      prayerOffered,
      missedPrayers,
      totalDays,
      mostOffered,
      mostMissed,
      bestDayDate
    });

    // Force no cache
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json({
      success: true,
      data: {
        offered: totalOffered,
        missed: totalMissed,
        completionRate: parseFloat(completionRate),
        totalDays,
        mostOffered,
        mostMissed,
        bestDay: bestDayDate,
        prayerCounts: prayerOffered,   // ✅ must be object, not number
        missedPrayers
      }
    });
  } catch (error) {
    console.error('❌ Monthly stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTodayPrayers = async (req, res) => {
  try {
    const today = getTodayStr();
    const defaultPrayers = { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };
    const entry = await PrayerEntry.findOneAndUpdate(
      { user: req.user._id, date: today },
      { $setOnInsert: { prayers: defaultPrayers } },
      { upsert: true, new: true, lean: true }
    );
    res.json(entry.prayers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTodayPrayers = async (req, res) => {
  try {
    const today = getTodayStr();
    const updates = req.body;
    const entry = await PrayerEntry.findOneAndUpdate(
      { user: req.user._id, date: today },
      { $set: { prayers: updates } },
      { new: true, upsert: true, lean: true }
    );
    res.json(entry.prayers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};