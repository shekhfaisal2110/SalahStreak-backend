// // import PrayerGroup from '../models/PrayerGroup.js';
// // import User from '../models/User.js';
// // import { sendEmail } from '../utils/emailService.js';

// // const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// // export const createGroup = async (req, res) => {
// //   try {
// //     const { name, area, pincode, times } = req.body;
// //     const existing = await PrayerGroup.findOne({ name, area });
// //     if (existing) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'A masjid with this name already exists in this area.'
// //       });
// //     }
// //     const group = new PrayerGroup({
// //       name, area, pincode, times,
// //       createdBy: req.user._id,
// //       updatedBy: req.user._id,
// //       pinned: false,
// //       updateHistory: []
// //     });
// //     await group.save();
// //     res.status(201).json({ success: true, data: group });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // export const getGroups = async (req, res) => {
// //   try {
// //     const { search, pincode } = req.query;
// //     const query = {};
// //     if (search) {
// //       query.$or = [
// //         { name: { $regex: search, $options: 'i' } },
// //         { area: { $regex: search, $options: 'i' } }
// //       ];
// //     }
// //     if (pincode) query.pincode = pincode;
// //     const groups = await PrayerGroup.find(query)
// //       .populate('createdBy', 'name email')
// //       .populate('updatedBy', 'name')
// //       .populate('updateHistory.user', 'name')
// //       .sort({ pinned: -1, updatedAt: -1 }); // pinned first
// //     res.json({ success: true, data: groups });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // export const getGroupById = async (req, res) => {
// //   try {
// //     const group = await PrayerGroup.findById(req.params.id)
// //       .populate('createdBy', 'name email')
// //       .populate('updatedBy', 'name')
// //       .populate('updateHistory.user', 'name');
// //     if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
// //     res.json({ success: true, data: group });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // export const updateGroup = async (req, res) => {
// //   try {
// //     const { times } = req.body;
// //     const group = await PrayerGroup.findById(req.params.id);
// //     if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

// //     const user = await User.findById(req.user._id);
// //     if (user.pincode !== group.pincode && user.email !== ADMIN_EMAIL) {
// //       return res.status(403).json({
// //         success: false,
// //         message: 'You can only edit groups in your pincode area'
// //       });
// //     }

// //     group.updateHistory.push({
// //       user: req.user._id,
// //       userName: user.name,
// //       updatedAt: new Date()
// //     });

// //     group.times = times;
// //     group.updatedBy = req.user._id;
// //     group.updatedAt = Date.now();
// //     await group.save();

// //     const updatedGroup = await PrayerGroup.findById(group._id)
// //       .populate('createdBy', 'name')
// //       .populate('updatedBy', 'name')
// //       .populate('updateHistory.user', 'name');

// //     res.json({ success: true, data: updatedGroup });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // export const togglePin = async (req, res) => {
// //   try {
// //     const group = await PrayerGroup.findById(req.params.id);
// //     if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
// //     group.pinned = !group.pinned;
// //     await group.save();
// //     res.json({ success: true, pinned: group.pinned });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // export const deleteGroup = async (req, res) => {
// //   try {
// //     const group = await PrayerGroup.findById(req.params.id).populate('createdBy', 'email name');
// //     if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

// //     const user = await User.findById(req.user._id);
// //     const isAdmin = user.email === ADMIN_EMAIL;

// //     if (user.pincode !== group.pincode && !isAdmin) {
// //       return res.status(403).json({
// //         success: false,
// //         message: 'You can only delete groups in your pincode area'
// //       });
// //     }

// //     if (!isAdmin && group.createdBy) {
// //       const creatorEmail = group.createdBy.email;
// //       const creatorName = group.createdBy.name || 'User';
// //       const subject = `Prayer Group "${group.name}" has been deleted`;
// //       const htmlContent = `
// //         <h2>Assalamu Alaikum ${creatorName},</h2>
// //         <p>The prayer group "<strong>${group.name}</strong>" in ${group.area} (${group.pincode}) was deleted by ${user.name || 'another user'}.</p>
// //         <p>If you did not expect this, please contact support.</p>
// //         <p>JazakAllah Khair.</p>
// //       `;
// //       try {
// //         await sendEmail({ to: creatorEmail, subject, htmlContent });
// //       } catch (emailError) {
// //         console.error('Failed to send deletion email:', emailError);
// //       }
// //     }

// //     await group.deleteOne();
// //     res.json({ success: true, message: 'Group deleted successfully' });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };














// import PrayerGroup from '../models/PrayerGroup.js';
// import User from '../models/User.js';
// import { sendEmail } from '../utils/emailService.js';

// const ADMIN_EMAIL = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim() : 'shekhfaisal.2110@gmail.com';

// // Helper to check if a user can modify a group
// const canModify = (user, group) => {
//   // Admin can always modify (case‑insensitive comparison)
//   if (user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return true;
//   // Otherwise, only if user has a pincode and it matches the group's pincode
//   return !!(user.pincode && group.pincode && user.pincode === group.pincode);
// };

// export const createGroup = async (req, res) => {
//   try {
//     const { name, area, pincode, times } = req.body;
//     const existing = await PrayerGroup.findOne({ name, area });
//     if (existing) {
//       return res.status(400).json({
//         success: false,
//         message: 'A masjid with this name already exists in this area.'
//       });
//     }
//     const group = new PrayerGroup({
//       name, area, pincode, times,
//       createdBy: req.user._id,
//       updatedBy: req.user._id,
//       pinned: false,
//       updateHistory: []
//     });
//     await group.save();
//     res.status(201).json({ success: true, data: group });
//   } catch (error) {
//     console.error('Create group error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const getGroups = async (req, res) => {
//   try {
//     const { search, pincode } = req.query;
//     const query = {};
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { area: { $regex: search, $options: 'i' } }
//       ];
//     }
//     if (pincode) query.pincode = pincode;
//     const groups = await PrayerGroup.find(query)
//       .populate('createdBy', 'name email')
//       .populate('updatedBy', 'name')
//       .populate('updateHistory.user', 'name')
//       .sort({ pinned: -1, updatedAt: -1 });
//     res.json({ success: true, data: groups });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const getGroupById = async (req, res) => {
//   try {
//     const group = await PrayerGroup.findById(req.params.id)
//       .populate('createdBy', 'name email')
//       .populate('updatedBy', 'name')
//       .populate('updateHistory.user', 'name');
//     if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
//     res.json({ success: true, data: group });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const updateGroup = async (req, res) => {
//   try {
//     const { times } = req.body;
//     const group = await PrayerGroup.findById(req.params.id);
//     if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

//     const user = await User.findById(req.user._id);
//     if (!canModify(user, group)) {
//       console.warn(`Access denied: user ${user.email} (pincode: ${user.pincode}) attempted to edit group ${group._id} (pincode: ${group.pincode})`);
//       return res.status(403).json({
//         success: false,
//         message: 'You can only edit groups in your pincode area or if you are an admin.'
//       });
//     }

//     group.updateHistory.push({
//       user: req.user._id,
//       userName: user.name,
//       updatedAt: new Date()
//     });

//     group.times = times;
//     group.updatedBy = req.user._id;
//     group.updatedAt = Date.now();
//     await group.save();

//     const updatedGroup = await PrayerGroup.findById(group._id)
//       .populate('createdBy', 'name')
//       .populate('updatedBy', 'name')
//       .populate('updateHistory.user', 'name');

//     res.json({ success: true, data: updatedGroup });
//   } catch (error) {
//     console.error('Update group error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const togglePin = async (req, res) => {
//   try {
//     const group = await PrayerGroup.findById(req.params.id);
//     if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
//     group.pinned = !group.pinned;
//     await group.save();
//     res.json({ success: true, pinned: group.pinned });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const deleteGroup = async (req, res) => {
//   try {
//     const group = await PrayerGroup.findById(req.params.id).populate('createdBy', 'email name');
//     if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

//     const user = await User.findById(req.user._id);
//     if (!canModify(user, group)) {
//       console.warn(`Delete denied: user ${user.email} (pincode: ${user.pincode}) attempted to delete group ${group._id} (pincode: ${group.pincode})`);
//       return res.status(403).json({
//         success: false,
//         message: 'You can only delete groups in your pincode area or if you are an admin.'
//       });
//     }

//     // Send email to creator (only if not admin)
//     if (!(user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) && group.createdBy) {
//       const creatorEmail = group.createdBy.email;
//       const creatorName = group.createdBy.name || 'User';
//       const subject = `Prayer Group "${group.name}" has been deleted`;
//       const htmlContent = `
//         <h2>Assalamu Alaikum ${creatorName},</h2>
//         <p>The prayer group "<strong>${group.name}</strong>" in ${group.area} (${group.pincode}) was deleted by ${user.name || 'another user'}.</p>
//         <p>If you did not expect this, please contact support.</p>
//         <p>JazakAllah Khair.</p>
//       `;
//       try {
//         await sendEmail({ to: creatorEmail, subject, htmlContent });
//       } catch (emailError) {
//         console.error('Failed to send deletion email:', emailError);
//       }
//     }

//     await group.deleteOne();
//     res.json({ success: true, message: 'Group deleted successfully' });
//   } catch (error) {
//     console.error('Delete group error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };






import PrayerGroup from '../models/PrayerGroup.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim() : 'shekhfaisal.2110@gmail.com';

// ✅ Helper to check modification rights (uses plain objects)
const canModify = (user, group) => {
  if (user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return true;
  return !!(user.pincode && group.pincode && user.pincode === group.pincode);
};

export const createGroup = async (req, res) => {
  try {
    const { name, area, pincode, times } = req.body;
    // ✅ Lean check
    const existing = await PrayerGroup.findOne({ name, area }).lean();
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
    console.error('Create group error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGroups = async (req, res) => {
  try {
    const { search, pincode } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      // ⚠️ For production, create a text index on name and area and use $text search
      // db.prayergroups.createIndex({ name: "text", area: "text" })
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } }
      ];
    }
    if (pincode) query.pincode = pincode;

    const [groups, totalCount] = await Promise.all([
      PrayerGroup.find(query)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name')
        .populate('updateHistory.user', 'name')
        .sort({ pinned: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // ✅ plain objects
      PrayerGroup.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: groups,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const group = await PrayerGroup.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name')
      .populate('updateHistory.user', 'name')
      .lean(); // ✅ lean
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

    const user = await User.findById(req.user._id).lean();
    if (!canModify(user, group)) {
      console.warn(`Access denied: user ${user.email} (pincode: ${user.pincode}) attempted to edit group ${group._id} (pincode: ${group.pincode})`);
      return res.status(403).json({
        success: false,
        message: 'You can only edit groups in your pincode area or if you are an admin.'
      });
    }

    // Update history
    group.updateHistory.push({
      user: req.user._id,
      userName: user.name,
      updatedAt: new Date()
    });
    group.times = times;
    group.updatedBy = req.user._id;
    group.updatedAt = Date.now();
    await group.save();

    // ✅ Populate and lean for response
    const updatedGroup = await PrayerGroup.findById(group._id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('updateHistory.user', 'name')
      .lean();

    res.json({ success: true, data: updatedGroup });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const togglePin = async (req, res) => {
  try {
    // ✅ Atomic update
    const group = await PrayerGroup.findByIdAndUpdate(
      req.params.id,
      [{ $set: { pinned: { $not: '$pinned' } } }],
      { new: true, lean: true }
    );
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    res.json({ success: true, pinned: group.pinned });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await PrayerGroup.findById(req.params.id).populate('createdBy', 'email name').lean();
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const user = await User.findById(req.user._id).lean();
    if (!canModify(user, group)) {
      console.warn(`Delete denied: user ${user.email} (pincode: ${user.pincode}) attempted to delete group ${group._id} (pincode: ${group.pincode})`);
      return res.status(403).json({
        success: false,
        message: 'You can only delete groups in your pincode area or if you are an admin.'
      });
    }

    // ✅ Delete the group first (atomic)
    await PrayerGroup.deleteOne({ _id: group._id });

    // ✅ Send email in background (non-blocking)
    const isAdmin = user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    if (!isAdmin && group.createdBy && group.createdBy.email) {
      const creatorEmail = group.createdBy.email;
      const creatorName = group.createdBy.name || 'User';
      const subject = `Prayer Group "${group.name}" has been deleted`;
      const htmlContent = `
        <h2>Assalamu Alaikum ${creatorName},</h2>
        <p>The prayer group "<strong>${group.name}</strong>" in ${group.area} (${group.pincode}) was deleted by ${user.name || 'another user'}.</p>
        <p>If you did not expect this, please contact support.</p>
        <p>JazakAllah Khair.</p>
      `;
      // Fire and forget – don't wait for email
      sendEmail({ to: creatorEmail, subject, htmlContent }).catch(err =>
        console.error('Failed to send deletion email:', err)
      );
    }

    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};