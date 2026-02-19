import Tasbeeh from '../models/Tasbeeh.js';

// Get all tasbeeh for user
export const getTasbeehList = async (req, res) => {
  try {
    const tasbeehs = await Tasbeeh.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: tasbeehs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new tasbeeh
export const createTasbeeh = async (req, res) => {
  try {
    const { name, arabicName, targetCount } = req.body;
    const tasbeeh = await Tasbeeh.create({
      user: req.user._id,
      name,
      arabicName,
      targetCount: targetCount || 33,
      currentCount: 0,
    });
    res.status(201).json({ success: true, data: tasbeeh });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Increment counter
// export const incrementTasbeeh = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const tasbeeh = await Tasbeeh.findOne({ _id: id, user: req.user._id });
//     if (!tasbeeh) {
//       return res.status(404).json({ success: false, message: 'Tasbeeh not found' });
//     }

//     tasbeeh.currentCount += 1;
//     if (tasbeeh.currentCount >= tasbeeh.targetCount && !tasbeeh.completed) {
//       tasbeeh.completed = true;
//       tasbeeh.completedAt = new Date();
//     }
//     await tasbeeh.save();

//     res.json({ success: true, data: tasbeeh });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// Increment counter (by 1 or custom amount)
export const incrementTasbeeh = async (req, res) => {
  try {
    const { id } = req.params;
    const { count = 1 } = req.body; // default to 1 if not provided

    const tasbeeh = await Tasbeeh.findOne({ _id: id, user: req.user._id });
    if (!tasbeeh) {
      return res.status(404).json({ success: false, message: 'Tasbeeh not found' });
    }

    // Don't increment if already completed
    if (tasbeeh.completed) {
      return res.status(400).json({ success: false, message: 'Tasbeeh already completed' });
    }

    // Add the custom count, but don't exceed target
    const newCount = Math.min(tasbeeh.currentCount + count, tasbeeh.targetCount);
    tasbeeh.currentCount = newCount;

    if (newCount >= tasbeeh.targetCount) {
      tasbeeh.completed = true;
      tasbeeh.completedAt = new Date();
    }

    await tasbeeh.save();
    res.json({ success: true, data: tasbeeh });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset counter
export const resetTasbeeh = async (req, res) => {
  try {
    const { id } = req.params;
    const tasbeeh = await Tasbeeh.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { currentCount: 0, completed: false, completedAt: null },
      { new: true }
    );
    res.json({ success: true, data: tasbeeh });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete tasbeeh
export const deleteTasbeeh = async (req, res) => {
  try {
    await Tasbeeh.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Update target count
export const updateTarget = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetCount } = req.body;

    if (!targetCount || targetCount < 1) {
      return res.status(400).json({ success: false, message: 'Invalid target count' });
    }

    const tasbeeh = await Tasbeeh.findOne({ _id: id, user: req.user._id });
    if (!tasbeeh) {
      return res.status(404).json({ success: false, message: 'Tasbeeh not found' });
    }

    tasbeeh.targetCount = targetCount;
    // If current count meets or exceeds new target, mark as completed
    if (tasbeeh.currentCount >= targetCount) {
      tasbeeh.completed = true;
      tasbeeh.completedAt = new Date();
    } else {
      tasbeeh.completed = false;
      tasbeeh.completedAt = null;
    }

    await tasbeeh.save();
    res.json({ success: true, data: tasbeeh });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};