import Feedback from '../models/Feedback.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim() : 'shekhfaisal.2110@gmail.com';

// ===================== User =====================
export const submitFeedback = async (req, res) => {
  try {
    const { type, message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    const feedback = await Feedback.create({
      user: req.user._id,
      type,
      message,
    });

    // Send notification to admin (using the ADMIN_EMAIL)
    const adminUser = await User.findOne({ email: ADMIN_EMAIL }).lean();
    if (adminUser) {
      await Notification.create({
        title: `📬 New ${type} from ${req.user.name}`,
        message: message.substring(0, 100) + (message.length > 100 ? '…' : ''),
        type: 'announcement',
        target: 'specific',
        userId: adminUser._id,
        readBy: [],
      });
    }

    res.status(201).json({ success: true, feedback });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== Admin =====================
export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const replyToFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply } = req.body;
    if (!adminReply) return res.status(400).json({ success: false, message: 'Reply is required' });

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { adminReply, status: 'replied', adminReplyDate: new Date() },
      { new: true, lean: true }
    );
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });

    // Send notification to user
    const user = await User.findById(feedback.user).lean();
    if (user) {
      await Notification.create({
        title: 'Reply to your feedback',
        message: `Your feedback "${feedback.message.substring(0, 50)}..." has been replied by admin: ${adminReply}`,
        type: 'announcement',
        target: 'specific',
        userId: user._id,
        readBy: [],
      });
    }

    res.json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};