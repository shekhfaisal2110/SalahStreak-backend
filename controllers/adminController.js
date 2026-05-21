import User from '../models/User.js';
import PrayerEntry from '../models/PrayerEntry.js';
import TasbeehDaily from '../models/TasbeehDaily.js';
import PrayerGroup from '../models/PrayerGroup.js';

// Get all users (exclude passwords)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password').lean();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    // Also delete all related data (prayers, tasbeeh, etc.) – optional
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get platform stats (total users, total prayers, total dhikr, etc.)
export const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPrayerEntries = await PrayerEntry.countDocuments();
    const totalTasbeehCounts = await TasbeehDaily.aggregate([
      { $group: { _id: null, total: { $sum: '$count' } } }
    ]);
    const totalDhikr = totalTasbeehCounts[0]?.total || 0;
    const totalPrayerGroups = await PrayerGroup.countDocuments();
    res.json({
      success: true,
      stats: { totalUsers, totalPrayerEntries, totalDhikr, totalPrayerGroups }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all prayer groups (admin view)
export const getAllPrayerGroups = async (req, res) => {
  try {
    const groups = await PrayerGroup.find().populate('createdBy', 'name email').lean();
    res.json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete any prayer group (admin)
export const deletePrayerGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    await PrayerGroup.findByIdAndDelete(groupId);
    res.json({ success: true, message: 'Group deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};