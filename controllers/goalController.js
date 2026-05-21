import Goal from '../models/Goal.js';
import Badge from '../models/Badge.js';
import PrayerEntry from '../models/PrayerEntry.js';
import Tasbeeh from '../models/Tasbeeh.js';
import QuranProgress from '../models/QuranProgress.js';
import User from '../models/User.js';

// Helper: Calculate current prayer stats for the last N days
const getPrayerStats = async (userId, days) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split('T')[0];
  const entries = await PrayerEntry.find({
    user: userId,
    date: { $gte: startStr }
  }).lean();
  let totalPrayers = 0;
  entries.forEach(entry => {
    totalPrayers += (entry.prayers.Fajr ? 1 : 0) +
                    (entry.prayers.Dhuhr ? 1 : 0) +
                    (entry.prayers.Asr ? 1 : 0) +
                    (entry.prayers.Maghrib ? 1 : 0) +
                    (entry.prayers.Isha ? 1 : 0);
  });
  return totalPrayers;
};

// Helper: Get total dhikr count (all time or since a date)
const getDhikrTotal = async (userId, sinceDate = null) => {
  const query = { user: userId };
  if (sinceDate) {
    query.createdAt = { $gte: sinceDate };
  }
  const tasbeehs = await Tasbeeh.find(query).lean();
  return tasbeehs.reduce((sum, t) => sum + (t.currentCount || 0), 0);
};

// Helper: Get total juz read (each para = 1 juz)
const getQuranJuzRead = async (userId, sinceDate = null) => {
  const query = { user: userId, completed: true };
  if (sinceDate) {
    query.completedAt = { $gte: sinceDate };
  }
  const completions = await QuranProgress.find(query).lean();
  // Each completion = 30 juz? Actually each completed cycle = 30 juz.
  // Simpler: count completed paras from active progress? But we'll use completions.
  let totalJuz = 0;
  for (const comp of completions) {
    totalJuz += 30; // each full completion = 30 juz
  }
  // Also count paras from currently active progress (incomplete)
  const active = await QuranProgress.findOne({ user: userId, completed: false }).lean();
  if (active) {
    totalJuz += active.paras.filter(p => p === true).length;
  }
  return totalJuz;
};

// Create a new goal
export const createGoal = async (req, res) => {
  try {
    const { title, description, type, category, targetValue, badge } = req.body;
    const userId = req.user._id;
    const endDate = type === 'weekly' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;
    const goal = await Goal.create({
      user: userId,
      title,
      description,
      type,
      category,
      targetValue,
      currentValue: 0,
      progress: 0,
      completed: false,
      endDate,
      badge
    });
    res.status(201).json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all goals for the logged-in user (active + completed)
export const getUserGoals = async (req, res) => {
  try {
    const userId = req.user._id;
    const goals = await Goal.find({ user: userId }).sort({ completed: 1, createdAt: -1 }).lean();
    // Recalculate progress in real-time for active goals
    const updatedGoals = await Promise.all(goals.map(async (goal) => {
      if (goal.completed) return goal;
      let currentValue = 0;
      const now = new Date();
      if (goal.category === 'prayer') {
        const days = goal.type === 'daily' ? 1 : 7;
        currentValue = await getPrayerStats(userId, days);
      } else if (goal.category === 'dhikr') {
        const sinceDate = goal.type === 'weekly' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : null;
        currentValue = await getDhikrTotal(userId, sinceDate);
      } else if (goal.category === 'quran') {
        const sinceDate = goal.type === 'weekly' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : null;
        currentValue = await getQuranJuzRead(userId, sinceDate);
      }
      const progress = Math.min(100, Math.floor((currentValue / goal.targetValue) * 100));
      let completed = false;
      let completedAt = null;
      if (currentValue >= goal.targetValue) {
        completed = true;
        completedAt = new Date();
        // Award badge if provided
        if (goal.badge) {
          await Badge.findOneAndUpdate(
            { user: userId, name: goal.badge },
            { name: goal.badge, description: goal.description, earnedAt: new Date() },
            { upsert: true }
          );
        }
        // Update goal in DB
        await Goal.updateOne({ _id: goal._id }, { $set: { completed: true, completedAt, currentValue, progress } });
      } else {
        await Goal.updateOne({ _id: goal._id }, { $set: { currentValue, progress } });
      }
      return { ...goal, currentValue, progress, completed, completedAt };
    }));
    res.json({ success: true, goals: updatedGoals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a goal
export const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    await Goal.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get earned badges
export const getUserBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ user: req.user._id }).sort({ earnedAt: -1 }).lean();
    res.json({ success: true, badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update an existing goal (only non-completed goals can be edited)
export const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, category, targetValue, badge } = req.body;
    const userId = req.user._id;

    const goal = await Goal.findOne({ _id: id, user: userId });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    if (goal.completed) {
      return res.status(400).json({ success: false, message: 'Completed goals cannot be edited' });
    }

    goal.title = title || goal.title;
    goal.description = description !== undefined ? description : goal.description;
    goal.type = type || goal.type;
    goal.category = category || goal.category;
    goal.targetValue = targetValue || goal.targetValue;
    goal.badge = badge !== undefined ? badge : goal.badge;
    await goal.save();

    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};