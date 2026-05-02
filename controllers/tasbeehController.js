// import Tasbeeh from '../models/Tasbeeh.js';
// import TasbeehDaily from '../models/TasbeehDaily.js';

// // Get all tasbeeh for user
// export const getTasbeehList = async (req, res) => {
//   try {
//     const tasbeehs = await Tasbeeh.find({ user: req.user._id }).sort({ createdAt: -1 });
//     res.json({ success: true, data: tasbeehs });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Create a new tasbeeh
// export const createTasbeeh = async (req, res) => {
//   try {
//     const { name, arabicName, targetCount } = req.body;
//     const tasbeeh = await Tasbeeh.create({
//       user: req.user._id,
//       name,
//       arabicName,
//       targetCount: targetCount || 33,
//       currentCount: 0,
//     });
//     res.status(201).json({ success: true, data: tasbeeh });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// // export const incrementTasbeeh = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const { count = 1 } = req.body; // default to 1 if not provided

// //     const tasbeeh = await Tasbeeh.findOne({ _id: id, user: req.user._id });
// //     if (!tasbeeh) {
// //       return res.status(404).json({ success: false, message: 'Tasbeeh not found' });
// //     }

// //     // Don't increment if already completed
// //     if (tasbeeh.completed) {
// //       return res.status(400).json({ success: false, message: 'Tasbeeh already completed' });
// //     }

// //     // Add the custom count, but don't exceed target
// //     const newCount = Math.min(tasbeeh.currentCount + count, tasbeeh.targetCount);
// //     tasbeeh.currentCount = newCount;

// //     if (newCount >= tasbeeh.targetCount) {
// //       tasbeeh.completed = true;
// //       tasbeeh.completedAt = new Date();
// //     }

// //     await tasbeeh.save();
// //     res.json({ success: true, data: tasbeeh });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // Reset counter

// export const incrementTasbeeh = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { count = 1 } = req.body;

//     const tasbeeh = await Tasbeeh.findOne({ _id: id, user: req.user._id });
//     if (!tasbeeh) {
//       return res.status(404).json({ success: false, message: 'Tasbeeh not found' });
//     }
//     if (tasbeeh.completed) {
//       return res.status(400).json({ success: false, message: 'Tasbeeh already completed' });
//     }

//     // Update overall count
//     const newCount = Math.min(tasbeeh.currentCount + count, tasbeeh.targetCount);
//     tasbeeh.currentCount = newCount;
//     if (newCount >= tasbeeh.targetCount) {
//       tasbeeh.completed = true;
//       tasbeeh.completedAt = new Date();
//     }
//     await tasbeeh.save();

//     // Update daily count
//     const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
//     const daily = await TasbeehDaily.findOneAndUpdate(
//       { user: req.user._id, tasbeeh: id, date: today },
//       { $inc: { count: count } },
//       { upsert: true, new: true }
//     );

//     res.json({ success: true, data: tasbeeh });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const resetTasbeeh = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const tasbeeh = await Tasbeeh.findOneAndUpdate(
//       { _id: id, user: req.user._id },
//       { currentCount: 0, completed: false, completedAt: null },
//       { new: true }
//     );
//     res.json({ success: true, data: tasbeeh });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Delete tasbeeh
// export const deleteTasbeeh = async (req, res) => {
//   try {
//     await Tasbeeh.findOneAndDelete({ _id: req.params.id, user: req.user._id });
//     res.json({ success: true, message: 'Deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



// // Update target count
// export const updateTarget = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { targetCount } = req.body;

//     if (!targetCount || targetCount < 1) {
//       return res.status(400).json({ success: false, message: 'Invalid target count' });
//     }

//     const tasbeeh = await Tasbeeh.findOne({ _id: id, user: req.user._id });
//     if (!tasbeeh) {
//       return res.status(404).json({ success: false, message: 'Tasbeeh not found' });
//     }

//     tasbeeh.targetCount = targetCount;
//     // If current count meets or exceeds new target, mark as completed
//     if (tasbeeh.currentCount >= targetCount) {
//       tasbeeh.completed = true;
//       tasbeeh.completedAt = new Date();
//     } else {
//       tasbeeh.completed = false;
//       tasbeeh.completedAt = null;
//     }

//     await tasbeeh.save();
//     res.json({ success: true, data: tasbeeh });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// // controllers/tasbeehController.js
// export const getDailyTotals = async (req, res) => {
//   try {
//     const { days = 30 } = req.query; // number of past days to fetch
//     const startDate = new Date();
//     startDate.setDate(startDate.getDate() - days);
//     const startDateStr = startDate.toISOString().split('T')[0];

//     const dailyTotals = await TasbeehDaily.aggregate([
//       {
//         $match: {
//           user: req.user._id,
//           date: { $gte: startDateStr }
//         }
//       },
//       {
//         $group: {
//           _id: '$date',
//           total: { $sum: '$count' }
//         }
//       },
//       { $sort: { _id: 1 } }
//     ]);

//     res.json({ success: true, data: dailyTotals });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// // Toggle pinned status
// export const togglePin = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const tasbeeh = await Tasbeeh.findOne({ _id: id, user: req.user._id });
//     if (!tasbeeh) {
//       return res.status(404).json({ success: false, message: 'Tasbeeh not found' });
//     }
//     tasbeeh.pinned = !tasbeeh.pinned;
//     await tasbeeh.save();
//     res.json({ success: true, data: tasbeeh });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Toggle showCount status
// export const toggleShowCount = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const tasbeeh = await Tasbeeh.findOne({ _id: id, user: req.user._id });
//     if (!tasbeeh) {
//       return res.status(404).json({ success: false, message: 'Tasbeeh not found' });
//     }
//     tasbeeh.showCount = !tasbeeh.showCount;
//     await tasbeeh.save();
//     res.json({ success: true, data: tasbeeh });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// // Get daily totals for a date range
// export const getDailyTotalsByDateRange = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
//     if (!startDate || !endDate) {
//       return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
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
//       { $sort: { _id: 1 } }
//     ]);

//     res.json({ success: true, data: dailyTotals });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// // Get daily completion status for a single tasbeeh (calendar view)
// export const getTasbeehDailyCompletion = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { startDate, endDate } = req.query;

//     if (!startDate || !endDate) {
//       return res.status(400).json({ success: false, message: 'startDate and endDate required' });
//     }

//     // Get the tasbeeh to know its targetCount
//     const tasbeeh = await Tasbeeh.findOne({ _id: id, user: req.user._id });
//     if (!tasbeeh) {
//       return res.status(404).json({ success: false, message: 'Tasbeeh not found' });
//     }

//     // Fetch daily counts from TasbeehDaily
//     const dailyRecords = await TasbeehDaily.find({
//       user: req.user._id,
//       tasbeeh: id,
//       date: { $gte: startDate, $lte: endDate }
//     });

//     // Build a map date -> count
//     const dailyMap = new Map();
//     dailyRecords.forEach(record => {
//       dailyMap.set(record.date, record.count);
//     });

//     // Generate all dates in range
//     const dates = [];
//     let current = new Date(startDate);
//     const end = new Date(endDate);
//     while (current <= end) {
//       const dateStr = current.toISOString().split('T')[0];
//       const count = dailyMap.get(dateStr) || 0;
//       const completed = count >= tasbeeh.targetCount;
//       dates.push({
//         date: dateStr,
//         count,
//         completed,
//         target: tasbeeh.targetCount
//       });
//       current.setDate(current.getDate() + 1);
//     }

//     res.json({
//       success: true,
//       data: {
//         tasbeeh: { id: tasbeeh._id, name: tasbeeh.name, targetCount: tasbeeh.targetCount },
//         dailyStatus: dates
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };








import Tasbeeh from '../models/Tasbeeh.js';
import TasbeehDaily from '../models/TasbeehDaily.js';

// ✅ Required indexes (add in schema):
// Tasbeeh: { user: 1, completed: 1, pinned: -1, createdAt: -1 }
// TasbeehDaily: { user: 1, tasbeeh: 1, date: 1 } unique, plus { user: 1, date: 1 }

// Get all tasbeeh for user (with pagination)
export const getTasbeehList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [tasbeehs, totalCount] = await Promise.all([
      Tasbeeh.find({ user: req.user._id })
        .sort({ pinned: -1, createdAt: -1 }) // pinned first, then newest
        .skip(skip)
        .limit(limit)
        .lean(), // ✅ fast plain objects
      Tasbeeh.countDocuments({ user: req.user._id })
    ]);

    res.json({
      success: true,
      data: tasbeehs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new tasbeeh
export const createTasbeeh = async (req, res) => {
  try {
    const { name, arabicName, targetCount } = req.body;
    const tasbeeh = await Tasbeeh.create({
      user: req.user._id,
      name,
      arabicName,
      targetCount: targetCount || 33,
      currentCount: 0,
      pinned: false,
      showCount: true,
    });
    res.status(201).json({ success: true, data: tasbeeh });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Increment tasbeeh (atomic) and update daily record in parallel
export const incrementTasbeeh = async (req, res) => {
  try {
    const { id } = req.params;
    let { count = 1 } = req.body;
    count = Math.min(Math.max(1, parseInt(count)), 100); // sanitize

    const today = new Date().toISOString().split('T')[0];

    // Step 1: Increment currentCount atomically, but only if not already completed
    const tasbeeh = await Tasbeeh.findOneAndUpdate(
      { _id: id, user: req.user._id, completed: false },
      { $inc: { currentCount: count } },
      { new: true, lean: true } // return updated doc
    );

    if (!tasbeeh) {
      // Check if it exists or already completed
      const existing = await Tasbeeh.findOne({ _id: id, user: req.user._id }).lean();
      if (!existing) return res.status(404).json({ success: false, message: 'Tasbeeh not found' });
      if (existing.completed) return res.status(400).json({ success: false, message: 'Tasbeeh already completed' });
      // fallback (should not reach here)
    }

    // Step 2: Check if new count reached or exceeded target
    let updatedTasbeeh = tasbeeh;
    if (tasbeeh.currentCount >= tasbeeh.targetCount && !tasbeeh.completed) {
      updatedTasbeeh = await Tasbeeh.findOneAndUpdate(
        { _id: id, user: req.user._id },
        { $set: { completed: true, completedAt: new Date() } },
        { new: true, lean: true }
      );
    }

    // Step 3: Update daily count (fire and forget)
    TasbeehDaily.findOneAndUpdate(
      { user: req.user._id, tasbeeh: id, date: today },
      { $inc: { count } },
      { upsert: true, lean: true }
    ).catch(err => console.error('Daily update failed:', err));

    res.json({ success: true, data: updatedTasbeeh || tasbeeh });
  } catch (error) {
    console.error('Increment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset tasbeeh counter
export const resetTasbeeh = async (req, res) => {
  try {
    const tasbeeh = await Tasbeeh.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { currentCount: 0, completed: false, completedAt: null } },
      { new: true, lean: true }
    );
    if (!tasbeeh) return res.status(404).json({ success: false, message: 'Tasbeeh not found' });
    res.json({ success: true, data: tasbeeh });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete tasbeeh
export const deleteTasbeeh = async (req, res) => {
  try {
    const result = await Tasbeeh.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!result) return res.status(404).json({ success: false, message: 'Tasbeeh not found' });
    // Optionally delete all related daily records in background
    TasbeehDaily.deleteMany({ tasbeeh: req.params.id, user: req.user._id }).catch(err => console.error(err));
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update target count (atomic)
export const updateTarget = async (req, res) => {
  try {
    const { id } = req.params;
    let { targetCount } = req.body;
    targetCount = parseInt(targetCount);
    if (isNaN(targetCount) || targetCount < 1) {
      return res.status(400).json({ success: false, message: 'Invalid target count' });
    }

    const tasbeeh = await Tasbeeh.findOneAndUpdate(
      { _id: id, user: req.user._id },
      [
        {
          $set: {
            targetCount: targetCount,
            completed: { $gte: ['$currentCount', targetCount] },
            completedAt: {
              $cond: {
                if: { $gte: ['$currentCount', targetCount] },
                then: new Date(),
                else: null
              }
            }
          }
        }
      ],
      { new: true, lean: true }
    );

    if (!tasbeeh) return res.status(404).json({ success: false, message: 'Tasbeeh not found' });
    res.json({ success: true, data: tasbeeh });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get daily totals for last N days (with lean)
export const getDailyTotals = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const limitDays = Math.min(parseInt(days), 365); // max 365 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - limitDays);
    const startDateStr = startDate.toISOString().split('T')[0];

    const dailyTotals = await TasbeehDaily.aggregate([
      { $match: { user: req.user._id, date: { $gte: startDateStr } } },
      { $group: { _id: '$date', total: { $sum: '$count' } } },
      { $sort: { _id: 1 } },
      { $limit: limitDays + 5 } // safe limit
    ]);

    res.json({ success: true, data: dailyTotals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle pinned status (atomic)
export const togglePin = async (req, res) => {
  try {
    const { id } = req.params;
    const tasbeeh = await Tasbeeh.findOneAndUpdate(
      { _id: id, user: req.user._id },
      [{ $set: { pinned: { $not: '$pinned' } } }],
      { new: true, lean: true }
    );
    if (!tasbeeh) return res.status(404).json({ success: false, message: 'Tasbeeh not found' });
    res.json({ success: true, data: tasbeeh });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle showCount status (atomic)
export const toggleShowCount = async (req, res) => {
  try {
    const { id } = req.params;
    const tasbeeh = await Tasbeeh.findOneAndUpdate(
      { _id: id, user: req.user._id },
      [{ $set: { showCount: { $not: '$showCount' } } }],
      { new: true, lean: true }
    );
    if (!tasbeeh) return res.status(404).json({ success: false, message: 'Tasbeeh not found' });
    res.json({ success: true, data: tasbeeh });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get daily totals by date range (with lean and limit)
export const getDailyTotalsByDateRange = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
    }
    // Limit date range to max 365 days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays > 365) {
      return res.status(400).json({ success: false, message: 'Date range cannot exceed 365 days' });
    }

    const dailyTotals = await TasbeehDaily.aggregate([
      { $match: { user: req.user._id, date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$date', total: { $sum: '$count' } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: dailyTotals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get daily completion status for a single tasbeeh (calendar view) with date range limit
export const getTasbeehDailyCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    let { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate required' });
    }

    // Limit date range to max 90 days to avoid memory issues
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      return res.status(400).json({ success: false, message: 'Date range cannot exceed 90 days' });
    }

    // Get tasbeeh (lean)
    const tasbeeh = await Tasbeeh.findOne({ _id: id, user: req.user._id }).lean();
    if (!tasbeeh) {
      return res.status(404).json({ success: false, message: 'Tasbeeh not found' });
    }

    // Fetch daily records (lean)
    const dailyRecords = await TasbeehDaily.find({
      user: req.user._id,
      tasbeeh: id,
      date: { $gte: startDate, $lte: endDate }
    }).lean();

    const dailyMap = new Map();
    dailyRecords.forEach(record => {
      dailyMap.set(record.date, record.count);
    });

    // Generate dates (efficient loop)
    const dates = [];
    let current = new Date(startDate);
    const endDateObj = new Date(endDate);
    while (current <= endDateObj) {
      const dateStr = current.toISOString().split('T')[0];
      const count = dailyMap.get(dateStr) || 0;
      dates.push({
        date: dateStr,
        count,
        completed: count >= tasbeeh.targetCount,
        target: tasbeeh.targetCount
      });
      current.setDate(current.getDate() + 1);
    }

    res.json({
      success: true,
      data: {
        tasbeeh: { id: tasbeeh._id, name: tasbeeh.name, targetCount: tasbeeh.targetCount },
        dailyStatus: dates
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};