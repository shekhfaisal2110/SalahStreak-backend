import QuranProgress from '../models/QuranProgress.js';
import QuranCompletion from '../models/QuranCompletion.js';

// Get current active progress
export const getCurrentProgress = async (req, res) => {
  try {
    const progress = await QuranProgress.findOne({
      user: req.user._id,
      completed: false,
    }).sort({ startDate: -1 });
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Start new goal
export const startNewProgress = async (req, res) => {
  try {
    const active = await QuranProgress.findOne({ user: req.user._id, completed: false });
    if (active) {
      return res.status(400).json({ success: false, message: 'You already have an active goal.' });
    }
    const progress = new QuranProgress({ user: req.user._id });
    await progress.save();
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark a para as completed
export const markPara = async (req, res) => {
  try {
    const { para } = req.params;
    const index = parseInt(para) - 1;
    if (index < 0 || index >= 30) {
      return res.status(400).json({ success: false, message: 'Invalid para number' });
    }

    const progress = await QuranProgress.findOne({ user: req.user._id, completed: false });
    if (!progress) {
      return res.status(404).json({ success: false, message: 'No active goal found' });
    }

    progress.paras[index] = true;
    await progress.save();

    const allCompleted = progress.paras.every(p => p === true);
    if (allCompleted) {
      progress.completed = true;
      progress.completedAt = new Date();
      await progress.save();

      const durationDays = Math.ceil((progress.completedAt - progress.startDate) / (1000 * 60 * 60 * 24));
      await QuranCompletion.create({
        user: req.user._id,
        completedAt: progress.completedAt,
        durationDays,
      });
    }

    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all completions (for history)
export const getCompletions = async (req, res) => {
  try {
    const completions = await QuranCompletion.find({ user: req.user._id }).sort({ completedAt: -1 });
    res.json({ success: true, data: completions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get completions for date range (for reports)
export const getCompletionsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user._id };
    if (startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00.000Z');
      const end = new Date(endDate + 'T23:59:59.999Z');
      query.completedAt = { $gte: start, $lte: end };
    }
    const completions = await QuranCompletion.find(query).sort({ completedAt: 1 });
    res.json({ success: true, data: completions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};