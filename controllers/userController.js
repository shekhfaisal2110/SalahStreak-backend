// controllers/userController.js
import User from '../models/User.js';

export const addSteps = async (req, res) => {
  try {
    const { steps } = req.body; // number of steps to add (e.g., 100)
    if (!steps || steps < 0) {
      return res.status(400).json({ success: false, message: 'Invalid steps value' });
    }

    const user = await User.findById(req.user._id);
    user.totalSteps += steps;
    await user.save();

    res.json({ success: true, totalSteps: user.totalSteps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};