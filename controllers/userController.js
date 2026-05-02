// // // controllers/userController.js
// // import User from '../models/User.js';

// // export const addSteps = async (req, res) => {
// //   try {
// //     const { steps } = req.body;
// //     if (!steps || steps < 0) {
// //       return res.status(400).json({ success: false, message: 'Invalid steps value' });
// //     }
// //     const user = await User.findById(req.user._id);
// //     user.totalSteps += steps;
// //     await user.save();
// //     res.json({ success: true, totalSteps: user.totalSteps });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // export const toggleShowRank = async (req, res) => {
// //   try {
// //     const user = await User.findById(req.user._id);
// //     user.showRank = !user.showRank;
// //     await user.save();
// //     res.json({ success: true, showRank: user.showRank });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };








// import User from '../models/User.js';

// export const addSteps = async (req, res) => {
//   try {
//     const { steps } = req.body;
//     if (!steps || steps < 0) {
//       return res.status(400).json({ success: false, message: 'Invalid steps value' });
//     }
//     const user = await User.findById(req.user._id);
//     user.totalSteps += steps;
//     await user.save();
//     res.json({ success: true, totalSteps: user.totalSteps });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const toggleShowRank = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     user.showRank = !user.showRank;
//     await user.save();
//     res.json({ success: true, showRank: user.showRank });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };




import User from '../models/User.js';

/**
 * Add steps to user's total steps (atomic increment)
 * @param {Number} steps - Positive integer to add
 */
export const addSteps = async (req, res) => {
  try {
    let { steps } = req.body;
    steps = parseInt(steps);
    if (isNaN(steps) || steps <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid steps value (must be positive integer)' });
    }
    // Limit max steps per request to prevent abuse
    steps = Math.min(steps, 100000);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { totalSteps: steps } },
      { new: true, lean: true, select: 'totalSteps' }
    );
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, totalSteps: updatedUser.totalSteps });
  } catch (error) {
    console.error('Add steps error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Toggle the showRank boolean (atomic)
 */
export const toggleShowRank = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      [{ $set: { showRank: { $not: '$showRank' } } }], // flip boolean
      { new: true, lean: true, select: 'showRank' }
    );
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, showRank: updatedUser.showRank });
  } catch (error) {
    console.error('Toggle showRank error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};