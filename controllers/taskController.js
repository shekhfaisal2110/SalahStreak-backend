import Task from '../models/Task.js';
import TaskEntry from '../models/TaskEntry.js';

// ========== Task CRUD ==========
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { name, scheduledTime, color } = req.body;
    if (!name || !scheduledTime) {
      return res.status(400).json({ success: false, message: 'Name and time are required' });
    }
    const task = new Task({
      user: req.user._id,
      name,
      scheduledTime,
      color,
    });
    await task.save();
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, scheduledTime, color } = req.body;
    const task = await Task.findOne({ _id: id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (name) task.name = name;
    if (scheduledTime) task.scheduledTime = scheduledTime;
    if (color) task.color = color;
    await task.save();
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    // Also delete all entries for this task
    await TaskEntry.deleteMany({ task: id });
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== Task Entries ==========
export const getEntriesForMonth = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { year, month } = req.query; // month 1-12
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = new Date(year, month, 0).toISOString().split('T')[0]; // last day of month

    const entries = await TaskEntry.find({
      user: req.user._id,
      task: taskId,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleEntry = async (req, res) => {
  try {
    const { taskId, date } = req.params; // date = YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    if (date !== today) {
      return res.status(400).json({ success: false, message: 'You can only log today\'s task.' });
    }

    let entry = await TaskEntry.findOne({ user: req.user._id, task: taskId, date });
    if (!entry) {
      entry = new TaskEntry({ user: req.user._id, task: taskId, date, completed: true });
    } else {
      entry.completed = !entry.completed;
    }
    await entry.save();

    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTaskStats = async (req, res) => {
  try {
    const { taskId } = req.params;
    const entries = await TaskEntry.find({ user: req.user._id, task: taskId }).sort({ date: -1 });

    let streak = 0;
    let today = new Date().toISOString().split('T')[0];
    let checkDate = new Date(today);
    for (let i = 0; i < entries.length; i++) {
      const entryDate = entries[i].date;
      if (entryDate === checkDate.toISOString().split('T')[0] && entries[i].completed) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const totalCompleted = entries.filter(e => e.completed).length;

    res.json({ success: true, data: { streak, totalCompleted } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== Overview (all tasks with entries for a month) ==========
export const getTasksWithEntries = async (req, res) => {
  try {
    const { year, month } = req.query; // month 1-12
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = new Date(year, month, 0).toISOString().split('T')[0];

    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    const entries = await TaskEntry.find({
      user: req.user._id,
      date: { $gte: start, $lte: end }
    });

    const entriesMap = {};
    entries.forEach(entry => {
      if (!entriesMap[entry.task]) entriesMap[entry.task] = {};
      entriesMap[entry.task][entry.date] = entry.completed;
    });

    const result = tasks.map(task => ({
      ...task.toObject(),
      entries: entriesMap[task._id] || {}
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== Completions for Log (with date filter) ==========
export const getAllCompletions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user._id, completed: true };
    if (startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00.000Z');
      const end = new Date(endDate + 'T23:59:59.999Z');
      // If you store the date as a string (YYYY-MM-DD) in a `date` field, use:
      query.date = { $gte: startDate, $lte: endDate };
      // If you store a Date object in `completedAt`, use:
      // query.completedAt = { $gte: start, $lte: end };
    }

    const completions = await TaskEntry.find(query)
      .populate('task', 'name scheduledTime')
      .sort({ date: -1, task: 1 });

    const formatted = completions.map(entry => ({
      id: entry._id,
      taskName: entry.task?.name || 'Unknown',
      date: entry.date,
      time: entry.task?.scheduledTime || '',
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get all entries for a task for a full year
export const getEntriesForYear = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { year } = req.query;
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;
    const entries = await TaskEntry.find({
      user: req.user._id,
      task: taskId,
      date: { $gte: start, $lte: end }
    });
    const entriesObj = {};
    entries.forEach(e => entriesObj[e.date] = e.completed);
    res.json({ success: true, data: entriesObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};