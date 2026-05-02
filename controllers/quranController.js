// import QuranProgress from '../models/QuranProgress.js';
// import QuranCompletion from '../models/QuranCompletion.js';

// // Get current active progress
// export const getCurrentProgress = async (req, res) => {
//   try {
//     const progress = await QuranProgress.findOne({
//       user: req.user._id,
//       completed: false,
//     }).sort({ startDate: -1 });
//     res.json({ success: true, data: progress });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Start new goal
// export const startNewProgress = async (req, res) => {
//   try {
//     const active = await QuranProgress.findOne({ user: req.user._id, completed: false });
//     if (active) {
//       return res.status(400).json({ success: false, message: 'You already have an active goal.' });
//     }
//     const progress = new QuranProgress({ user: req.user._id });
//     await progress.save();
//     res.json({ success: true, data: progress });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Mark a para as completed
// export const markPara = async (req, res) => {
//   try {
//     const { para } = req.params;
//     const index = parseInt(para) - 1;
//     if (index < 0 || index >= 30) {
//       return res.status(400).json({ success: false, message: 'Invalid para number' });
//     }

//     const progress = await QuranProgress.findOne({ user: req.user._id, completed: false });
//     if (!progress) {
//       return res.status(404).json({ success: false, message: 'No active goal found' });
//     }

//     progress.paras[index] = true;
//     await progress.save();

//     const allCompleted = progress.paras.every(p => p === true);
//     if (allCompleted) {
//       progress.completed = true;
//       progress.completedAt = new Date();
//       await progress.save();

//       const durationDays = Math.ceil((progress.completedAt - progress.startDate) / (1000 * 60 * 60 * 24));
//       await QuranCompletion.create({
//         user: req.user._id,
//         completedAt: progress.completedAt,
//         durationDays,
//       });
//     }

//     res.json({ success: true, data: progress });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get all completions (for history)
// export const getCompletions = async (req, res) => {
//   try {
//     const completions = await QuranCompletion.find({ user: req.user._id }).sort({ completedAt: -1 });
//     res.json({ success: true, data: completions });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get completions for date range (for reports)
// export const getCompletionsByDateRange = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
//     const query = { user: req.user._id };
//     if (startDate && endDate) {
//       const start = new Date(startDate + 'T00:00:00.000Z');
//       const end = new Date(endDate + 'T23:59:59.999Z');
//       query.completedAt = { $gte: start, $lte: end };
//     }
//     const completions = await QuranCompletion.find(query).sort({ completedAt: 1 });
//     res.json({ success: true, data: completions });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };





import QuranProgress from '../models/QuranProgress.js';
import QuranCompletion from '../models/QuranCompletion.js';

// ✅ Ensure indexes in schemas:
// QuranProgress: { user: 1, completed: 1, startDate: -1 }
// QuranCompletion: { user: 1, completedAt: -1 }

// Get current active progress (only one active per user)
export const getCurrentProgress = async (req, res) => {
  try {
    const progress = await QuranProgress.findOne({
      user: req.user._id,
      completed: false,
    })
      .sort({ startDate: -1 })
      .lean(); // ✅ plain object
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Start new goal
export const startNewProgress = async (req, res) => {
  try {
    // ✅ lean check
    const active = await QuranProgress.findOne({
      user: req.user._id,
      completed: false,
    }).lean();
    if (active) {
      return res.status(400).json({ success: false, message: 'You already have an active goal.' });
    }
    const progress = new QuranProgress({ user: req.user._id });
    await progress.save();
    res.status(201).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark a para as completed (atomic, then check completion)
export const markPara = async (req, res) => {
  try {
    const { para } = req.params;
    const index = parseInt(para) - 1;
    if (index < 0 || index >= 30) {
      return res.status(400).json({ success: false, message: 'Invalid para number' });
    }

    // ✅ Atomic update: mark specific para true, only if not already completed
    const updateField = { [`paras.${index}`]: true };
    const progress = await QuranProgress.findOneAndUpdate(
      { user: req.user._id, completed: false, [`paras.${index}`]: { $ne: true } }, // avoid redundant update
      { $set: updateField },
      { new: true, lean: true } // return updated doc
    );

    if (!progress) {
      // Check if already completed or no active goal
      const existingActive = await QuranProgress.findOne({ user: req.user._id, completed: false }).lean();
      if (!existingActive) {
        return res.status(404).json({ success: false, message: 'No active goal found' });
      }
      // If already marked true, still success (idempotent)
      const alreadyTrue = await QuranProgress.findOne({
        user: req.user._id,
        completed: false,
        [`paras.${index}`]: true
      }).lean();
      if (alreadyTrue) {
        // Still need to check if all completed
        const allCompleted = alreadyTrue.paras.every(p => p === true);
        if (allCompleted && !alreadyTrue.completed) {
          // Mark as completed (but we don't have the doc object here, so we'll update)
          await QuranProgress.updateOne(
            { _id: alreadyTrue._id },
            { $set: { completed: true, completedAt: new Date() } }
          );
          const durationDays = Math.ceil((new Date() - alreadyTrue.startDate) / (1000 * 60 * 60 * 24));
          await QuranCompletion.create({
            user: req.user._id,
            completedAt: new Date(),
            durationDays,
          });
        }
        return res.json({ success: true, data: alreadyTrue });
      }
      return res.status(404).json({ success: false, message: 'No active goal found' });
    }

    // Check if all paras are now true
    const allCompleted = progress.paras.every(p => p === true);
    if (allCompleted) {
      // Update to completed and create completion record
      await QuranProgress.updateOne(
        { _id: progress._id },
        { $set: { completed: true, completedAt: new Date() } }
      );
      const durationDays = Math.ceil((new Date() - progress.startDate) / (1000 * 60 * 60 * 24));
      await QuranCompletion.create({
        user: req.user._id,
        completedAt: new Date(),
        durationDays,
      });
      // Update progress object for response
      progress.completed = true;
      progress.completedAt = new Date();
    }

    res.json({ success: true, data: progress });
  } catch (error) {
    console.error('Mark para error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all completions (history) with pagination
export const getCompletions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [completions, totalCount] = await Promise.all([
      QuranCompletion.find({ user: req.user._id })
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // ✅ plain objects
      QuranCompletion.countDocuments({ user: req.user._id })
    ]);

    res.json({
      success: true,
      data: completions,
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

// Get completions for date range with default last 90 days
export const getCompletionsByDateRange = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    const query = { user: req.user._id };

    if (!startDate || !endDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 90);
      startDate = start.toISOString().slice(0, 10);
      endDate = end.toISOString().slice(0, 10);
    }
    
    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T23:59:59.999Z');
    query.completedAt = { $gte: start, $lte: end };

    const completions = await QuranCompletion.find(query)
      .sort({ completedAt: 1 }) // ascending for timeline
      .lean();
    
    res.json({ success: true, data: completions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};