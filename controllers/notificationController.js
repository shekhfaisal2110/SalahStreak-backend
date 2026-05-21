import Notification from '../models/Notification.js';
import User from '../models/User.js';

// ========== User routes ==========
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({
      $or: [
        { target: 'all' },
        { target: 'specific', userId: userId }
      ]
    }).sort({ createdAt: -1 }).limit(50).lean();

    const enriched = notifications.map(n => ({
      ...n,
      isRead: n.readBy?.some(id => id.toString() === userId.toString()) || false
    }));
    res.setHeader('Cache-Control', 'private, max-age=30');
    res.json({ success: true, notifications: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.updateOne(
      { _id: notificationId },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== Admin routes ==========
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { title, message, type, target, userId } = req.body;
    const notification = await Notification.create({
      title, message, type: type || 'announcement',
      target: target || 'all',
      userId: target === 'specific' ? userId : null,
      readBy: []
    });
    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Auto‑welcome (called from verifyOtp)
export const sendWelcomeNotification = async (userId, userName) => {
  try {
    await Notification.create({
      title: '🌙 Welcome to Salah Streak',
      message: `Assalamu Alaikum ${userName}! May Allah accept your ibadah. Start tracking your prayers and dhikr today.`,
      type: 'announcement',
      target: 'specific',
      userId,
      readBy: []
    });
  } catch (error) { console.error('Welcome notification failed:', error); }
};