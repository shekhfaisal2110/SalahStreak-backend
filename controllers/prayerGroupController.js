import PrayerGroup from '../models/PrayerGroup.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export const createGroup = async (req, res) => {
  try {
    const { name, area, pincode, times } = req.body;
    const existing = await PrayerGroup.findOne({ name, area });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A masjid with this name already exists in this area.'
      });
    }
    const group = new PrayerGroup({
      name, area, pincode, times,
      createdBy: req.user._id,
      updatedBy: req.user._id,
      pinned: false,
      updateHistory: []
    });
    await group.save();
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGroups = async (req, res) => {
  try {
    const { search, pincode } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } }
      ];
    }
    if (pincode) query.pincode = pincode;
    const groups = await PrayerGroup.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name')
      .populate('updateHistory.user', 'name')
      .sort({ pinned: -1, updatedAt: -1 }); // pinned first
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const group = await PrayerGroup.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name')
      .populate('updateHistory.user', 'name');
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    res.json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { times } = req.body;
    const group = await PrayerGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const user = await User.findById(req.user._id);
    if (user.pincode !== group.pincode && user.email !== ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit groups in your pincode area'
      });
    }

    group.updateHistory.push({
      user: req.user._id,
      userName: user.name,
      updatedAt: new Date()
    });

    group.times = times;
    group.updatedBy = req.user._id;
    group.updatedAt = Date.now();
    await group.save();

    const updatedGroup = await PrayerGroup.findById(group._id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('updateHistory.user', 'name');

    res.json({ success: true, data: updatedGroup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const togglePin = async (req, res) => {
  try {
    const group = await PrayerGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    group.pinned = !group.pinned;
    await group.save();
    res.json({ success: true, pinned: group.pinned });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await PrayerGroup.findById(req.params.id).populate('createdBy', 'email name');
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const user = await User.findById(req.user._id);
    const isAdmin = user.email === ADMIN_EMAIL;

    if (user.pincode !== group.pincode && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete groups in your pincode area'
      });
    }

    if (!isAdmin && group.createdBy) {
      const creatorEmail = group.createdBy.email;
      const creatorName = group.createdBy.name || 'User';
      const subject = `Prayer Group "${group.name}" has been deleted`;
      const htmlContent = `
        <h2>Assalamu Alaikum ${creatorName},</h2>
        <p>The prayer group "<strong>${group.name}</strong>" in ${group.area} (${group.pincode}) was deleted by ${user.name || 'another user'}.</p>
        <p>If you did not expect this, please contact support.</p>
        <p>JazakAllah Khair.</p>
      `;
      try {
        await sendEmail({ to: creatorEmail, subject, htmlContent });
      } catch (emailError) {
        console.error('Failed to send deletion email:', emailError);
      }
    }

    await group.deleteOne();
    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};