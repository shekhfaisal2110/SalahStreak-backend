// // import PrayerEntry from '../models/PrayerEntry.js';
// // import User from '../models/User.js';

// // // Get all entries for user
// // export const getPrayerBook = async (req, res) => {
// //   try {
// //     const entries = await PrayerEntry.find({ user: req.user._id }).sort({ date: -1 });
// //     res.json({ success: true, data: { entries, streak: req.user.streak } });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // // Update a prayer for a specific date
// // export const updatePrayer = async (req, res) => {
// //   try {
// //     const { date, prayer, value } = req.body;
// //     const userId = req.user._id;

// //     let entry = await PrayerEntry.findOne({ user: userId, date });
// //     if (!entry) {
// //       entry = new PrayerEntry({ user: userId, date, prayers: {} });
// //     }

// //     entry.prayers[prayer] = value;
// //     await entry.save();

// //     // Update streak logic
// //     const today = new Date().toISOString().split('T')[0];
// //     if (date === today) {
// //       // Check if all prayers are offered today
// //       const allOffered = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].every(p => entry.prayers[p] === true);
// //       if (allOffered) {
// //         // Check if last prayer date was yesterday
// //         const lastDate = req.user.lastPrayerDate ? new Date(req.user.lastPrayerDate).toISOString().split('T')[0] : null;
// //         const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
// //         let newStreak = req.user.streak;
// //         if (lastDate === yesterday) {
// //           newStreak += 1;
// //         } else if (lastDate !== today) {
// //           newStreak = 1; // reset or start new streak
// //         }
// //         req.user.streak = newStreak;
// //         req.user.lastPrayerDate = new Date();
// //         await req.user.save();
// //       }
// //     }

// //     res.json({ success: true, data: { streak: req.user.streak } });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // // Get stats for a specific month/year
// // export const getMonthlyStats = async (req, res) => {
// //   try {
// //     const { year, month } = req.params;
// //     const startDate = `${year}-${month.padStart(2, '0')}-01`;
// //     const endDate = new Date(year, month, 0).toISOString().split('T')[0];

// //     const entries = await PrayerEntry.find({
// //       user: req.user._id,
// //       date: { $gte: startDate, $lte: endDate },
// //     });

// //     const prayerCounts = { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
// //     const missedPrayers = { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
// //     let offered = 0;
// //     let missed = 0;
// //     const dailyCounts = {};

// //     entries.forEach(entry => {
// //       let dayOffered = 0;
// //       ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(p => {
// //         if (entry.prayers[p]) {
// //           prayerCounts[p]++;
// //           offered++;
// //           dayOffered++;
// //         } else {
// //           missedPrayers[p]++;
// //           missed++;
// //         }
// //       });
// //       dailyCounts[entry.date] = dayOffered;
// //     });

// //     const totalDays = entries.length;
// //     const completionRate = totalDays ? ((offered / (totalDays * 5)) * 100).toFixed(1) : 0;

// //     const mostOffered = Object.keys(prayerCounts).reduce((a, b) => prayerCounts[a] > prayerCounts[b] ? a : b, 'Fajr');
// //     const mostMissed = Object.keys(missedPrayers).reduce((a, b) => missedPrayers[a] > missedPrayers[b] ? a : b, 'Fajr');
// //     const bestDay = Object.keys(dailyCounts).reduce((a, b) => dailyCounts[a] > dailyCounts[b] ? a : b, null);

// //     res.json({
// //       success: true,
// //       data: {
// //         offered,
// //         missed,
// //         completionRate,
// //         totalDays,
// //         mostOffered: prayerCounts[mostOffered] > 0 ? mostOffered : '-',
// //         mostMissed: missedPrayers[mostMissed] > 0 ? mostMissed : '-',
// //         bestDay,
// //         prayerCounts,
// //         missedPrayers,
// //       },
// //     });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };


// // // Get today's prayers
// // export const getTodayPrayers = async (req, res) => {
// //   try {
// //     const today = new Date().toISOString().split('T')[0];
// //     let entry = await PrayerEntry.findOne({ user: req.user._id, date: today });
// //     if (!entry) {
// //       entry = new PrayerEntry({
// //         user: req.user._id,
// //         date: today,
// //         prayers: { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false }
// //       });
// //       await entry.save();
// //     }
// //     res.json(entry.prayers);
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // };

// // // Update today's prayers (bulk update)
// // export const updateTodayPrayers = async (req, res) => {
// //   try {
// //     const today = new Date().toISOString().split('T')[0];
// //     const updates = req.body;
// //     const entry = await PrayerEntry.findOneAndUpdate(
// //       { user: req.user._id, date: today },
// //       { prayers: updates },
// //       { new: true, upsert: true }
// //     );
// //     res.json(entry.prayers);
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // };











// import PrayerEntry from '../models/PrayerEntry.js';
// import User from '../models/User.js';

// // Get all entries for user
// export const getPrayerBook = async (req, res) => {
//   try {
//     const entries = await PrayerEntry.find({ user: req.user._id }).sort({ date: -1 });
//     res.json({ success: true, data: { entries, streak: req.user.streak } });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Update a prayer for a specific date
// export const updatePrayer = async (req, res) => {
//   try {
//     const { date, prayer, value } = req.body;
//     const userId = req.user._id;

//     // Find or create prayer entry for the date
//     let entry = await PrayerEntry.findOne({ user: userId, date });
//     if (!entry) {
//       entry = new PrayerEntry({ user: userId, date, prayers: {} });
//     }
//     entry.prayers[prayer] = value;
//     await entry.save();

//     // --- Streak update logic (only for today) ---
//     const today = new Date().toISOString().split('T')[0];
//     if (date === today) {
//       // Check if all 5 prayers are completed today
//       const allOffered = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].every(p => entry.prayers[p] === true);
      
//       // Fetch the latest user data from DB
//       const user = await User.findById(userId);
//       const lastDate = user.lastPrayerDate ? new Date(user.lastPrayerDate).toISOString().split('T')[0] : null;
//       const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
//       let newStreak = user.streak;
      
//       if (allOffered) {
//         if (lastDate === yesterday) {
//           newStreak += 1;               // continue streak
//         } else if (lastDate !== today) {
//           newStreak = 1;                // start new streak
//         }
//         // If lastDate === today, do nothing (already counted)
        
//         user.streak = newStreak;
//         user.lastPrayerDate = new Date();
//         await user.save();
        
//         // Update the session user object for immediate response
//         req.user.streak = newStreak;
//         req.user.lastPrayerDate = user.lastPrayerDate;
//       } else {
//         // If not all prayers are completed, do not change streak
//         // (previous streak remains, but lastPrayerDate is not updated)
//       }
//     }

//     // Return the updated streak
//     res.json({ success: true, data: { streak: req.user.streak } });
//   } catch (error) {
//     console.error('Update prayer error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get stats for a specific month/year
// export const getMonthlyStats = async (req, res) => {
//   try {
//     const { year, month } = req.params;
//     const startDate = `${year}-${month.padStart(2, '0')}-01`;
//     const endDate = new Date(year, month, 0).toISOString().split('T')[0];

//     const entries = await PrayerEntry.find({
//       user: req.user._id,
//       date: { $gte: startDate, $lte: endDate },
//     });

//     const prayerCounts = { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
//     const missedPrayers = { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
//     let offered = 0;
//     let missed = 0;
//     const dailyCounts = {};

//     entries.forEach(entry => {
//       let dayOffered = 0;
//       ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(p => {
//         if (entry.prayers[p]) {
//           prayerCounts[p]++;
//           offered++;
//           dayOffered++;
//         } else {
//           missedPrayers[p]++;
//           missed++;
//         }
//       });
//       dailyCounts[entry.date] = dayOffered;
//     });

//     const totalDays = entries.length;
//     const completionRate = totalDays ? ((offered / (totalDays * 5)) * 100).toFixed(1) : 0;

//     const mostOffered = Object.keys(prayerCounts).reduce((a, b) => prayerCounts[a] > prayerCounts[b] ? a : b, 'Fajr');
//     const mostMissed = Object.keys(missedPrayers).reduce((a, b) => missedPrayers[a] > missedPrayers[b] ? a : b, 'Fajr');
//     const bestDay = Object.keys(dailyCounts).reduce((a, b) => dailyCounts[a] > dailyCounts[b] ? a : b, null);

//     res.json({
//       success: true,
//       data: {
//         offered,
//         missed,
//         completionRate,
//         totalDays,
//         mostOffered: prayerCounts[mostOffered] > 0 ? mostOffered : '-',
//         mostMissed: missedPrayers[mostMissed] > 0 ? mostMissed : '-',
//         bestDay,
//         prayerCounts,
//         missedPrayers,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get today's prayers
// export const getTodayPrayers = async (req, res) => {
//   try {
//     const today = new Date().toISOString().split('T')[0];
//     let entry = await PrayerEntry.findOne({ user: req.user._id, date: today });
//     if (!entry) {
//       entry = new PrayerEntry({
//         user: req.user._id,
//         date: today,
//         prayers: { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false }
//       });
//       await entry.save();
//     }
//     res.json(entry.prayers);
//   } catch (error) {
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
//       { prayers: updates },
//       { new: true, upsert: true }
//     );
//     res.json(entry.prayers);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };








import PrayerEntry from '../models/PrayerEntry.js';
import User from '../models/User.js';

// ✅ Ensure indexes in schema:
// - { user: 1, date: 1 } unique
// - { user: 1, date: -1 } for sorting
// - { user: 1, createdAt: -1 } for pagination (if needed)

// Get all entries for user with pagination
export const getPrayerBook = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const [entries, totalCount] = await Promise.all([
      PrayerEntry.find({ user: req.user._id })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // ✅ plain JS objects
      PrayerEntry.countDocuments({ user: req.user._id })
    ]);

    res.json({
      success: true,
      data: {
        entries,
        streak: req.user.streak,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a prayer for a specific date (atomic)
export const updatePrayer = async (req, res) => {
  try {
    const { date, prayer, value } = req.body;
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    // ✅ Atomic upsert: update specific prayer field
    const update = { $set: { [`prayers.${prayer}`]: value } };
    const entry = await PrayerEntry.findOneAndUpdate(
      { user: userId, date },
      update,
      { upsert: true, new: true, lean: true }
    );

    let newStreak = req.user.streak;

    // Streak update logic (only for today and if all prayers completed)
    if (date === today) {
      const allOffered = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].every(p => entry.prayers[p] === true);
      
      if (allOffered) {
        // Fetch user only once and atomically update streak if needed
        const user = await User.findById(userId);
        const lastDate = user.lastPrayerDate ? user.lastPrayerDate.toISOString().split('T')[0] : null;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        if (lastDate === yesterday) {
          newStreak = user.streak + 1;
        } else if (lastDate !== today) {
          newStreak = 1;
        } else {
          newStreak = user.streak; // already counted today
        }
        
        if (newStreak !== user.streak) {
          await User.updateOne(
            { _id: userId },
            { $set: { streak: newStreak, lastPrayerDate: new Date() } }
          );
          req.user.streak = newStreak;
        }
      }
    }

    res.json({ success: true, data: { streak: newStreak } });
  } catch (error) {
    console.error('Update prayer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get stats for a specific month/year using aggregation (fast)
export const getMonthlyStats = async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.padStart(2, '0')}-${lastDay}`;
    const userId = req.user._id;

    const [result] = await PrayerEntry.aggregate([
      { $match: { user: userId, date: { $gte: startDate, $lte: endDate } } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalOffered: {
                  $sum: {
                    $add: [
                      { $cond: ['$prayers.Fajr', 1, 0] },
                      { $cond: ['$prayers.Dhuhr', 1, 0] },
                      { $cond: ['$prayers.Asr', 1, 0] },
                      { $cond: ['$prayers.Maghrib', 1, 0] },
                      { $cond: ['$prayers.Isha', 1, 0] }
                    ]
                  }
                },
                daysCount: { $sum: 1 },
                prayerCounts: {
                  $sum: {
                    Fajr: { $cond: ['$prayers.Fajr', 1, 0] },
                    Dhuhr: { $cond: ['$prayers.Dhuhr', 1, 0] },
                    Asr: { $cond: ['$prayers.Asr', 1, 0] },
                    Maghrib: { $cond: ['$prayers.Maghrib', 1, 0] },
                    Isha: { $cond: ['$prayers.Isha', 1, 0] }
                  }
                }
              }
            }
          ],
          dailySums: [
            {
              $project: {
                date: 1,
                dailyTotal: {
                  $add: [
                    { $cond: ['$prayers.Fajr', 1, 0] },
                    { $cond: ['$prayers.Dhuhr', 1, 0] },
                    { $cond: ['$prayers.Asr', 1, 0] },
                    { $cond: ['$prayers.Maghrib', 1, 0] },
                    { $cond: ['$prayers.Isha', 1, 0] }
                  ]
                }
              }
            },
            { $sort: { dailyTotal: -1 } },
            { $limit: 1 },
            { $project: { bestDay: '$date', maxTotal: '$dailyTotal' } }
          ]
        }
      }
    ]);

    if (!result.totals.length || result.totals[0].daysCount === 0) {
      return res.json({
        success: true,
        data: {
          offered: 0,
          missed: 0,
          completionRate: 0,
          totalDays: 0,
          mostOffered: '-',
          mostMissed: '-',
          bestDay: null,
          prayerCounts: { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 },
          missedPrayers: { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 }
        }
      });
    }

    const totals = result.totals[0];
    const totalPrayers = totals.daysCount * 5;
    const offered = totals.totalOffered;
    const missed = totalPrayers - offered;
    const completionRate = totalPrayers ? ((offered / totalPrayers) * 100).toFixed(1) : 0;
    const prayerCounts = totals.prayerCounts;
    const missedPrayers = {
      Fajr: totals.daysCount - prayerCounts.Fajr,
      Dhuhr: totals.daysCount - prayerCounts.Dhuhr,
      Asr: totals.daysCount - prayerCounts.Asr,
      Maghrib: totals.daysCount - prayerCounts.Maghrib,
      Isha: totals.daysCount - prayerCounts.Isha
    };

    const mostOffered = Object.keys(prayerCounts).reduce((a, b) => prayerCounts[a] > prayerCounts[b] ? a : b, 'Fajr');
    const mostMissed = Object.keys(missedPrayers).reduce((a, b) => missedPrayers[a] > missedPrayers[b] ? a : b, 'Fajr');
    const bestDay = result.dailySums[0]?.bestDay || null;

    res.json({
      success: true,
      data: {
        offered,
        missed,
        completionRate,
        totalDays: totals.daysCount,
        mostOffered: prayerCounts[mostOffered] > 0 ? mostOffered : '-',
        mostMissed: missedPrayers[mostMissed] > 0 ? mostMissed : '-',
        bestDay,
        prayerCounts,
        missedPrayers
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get today's prayers (atomic upsert + lean)
export const getTodayPrayers = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const defaultPrayers = { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };
    
    const entry = await PrayerEntry.findOneAndUpdate(
      { user: req.user._id, date: today },
      { $setOnInsert: { prayers: defaultPrayers } },
      { upsert: true, new: true, lean: true }
    );
    
    res.json(entry.prayers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Update today's prayers (bulk update)
export const updateTodayPrayers = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const updates = req.body;
    const entry = await PrayerEntry.findOneAndUpdate(
      { user: req.user._id, date: today },
      { $set: { prayers: updates } },
      { new: true, upsert: true, lean: true }
    );
    res.json(entry.prayers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};