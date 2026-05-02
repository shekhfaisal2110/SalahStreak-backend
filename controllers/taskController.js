// import Task from '../models/Task.js';
// import TaskEntry from '../models/TaskEntry.js';

// // ========== Task CRUD ==========
// export const getTasks = async (req, res) => {
//   try {
//     const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
//     res.json({ success: true, data: tasks });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const createTask = async (req, res) => {
//   try {
//     const { name, scheduledTime, color } = req.body;
//     if (!name || !scheduledTime) {
//       return res.status(400).json({ success: false, message: 'Name and time are required' });
//     }
//     const task = new Task({
//       user: req.user._id,
//       name,
//       scheduledTime,
//       color,
//     });
//     await task.save();
//     res.json({ success: true, data: task });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const updateTask = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, scheduledTime, color } = req.body;
//     const task = await Task.findOne({ _id: id, user: req.user._id });
//     if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

//     if (name) task.name = name;
//     if (scheduledTime) task.scheduledTime = scheduledTime;
//     if (color) task.color = color;
//     await task.save();
//     res.json({ success: true, data: task });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const deleteTask = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const task = await Task.findOneAndDelete({ _id: id, user: req.user._id });
//     if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
//     // Also delete all entries for this task
//     await TaskEntry.deleteMany({ task: id });
//     res.json({ success: true, message: 'Task deleted' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ========== Task Entries ==========
// export const getEntriesForMonth = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const { year, month } = req.query; // month 1-12
//     const start = `${year}-${String(month).padStart(2, '0')}-01`;
//     const end = new Date(year, month, 0).toISOString().split('T')[0]; // last day of month

//     const entries = await TaskEntry.find({
//       user: req.user._id,
//       task: taskId,
//       date: { $gte: start, $lte: end },
//     }).sort({ date: 1 });

//     res.json({ success: true, data: entries });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const toggleEntry = async (req, res) => {
//   try {
//     const { taskId, date } = req.params; // date = YYYY-MM-DD
//     const today = new Date().toISOString().split('T')[0];
//     if (date !== today) {
//       return res.status(400).json({ success: false, message: 'You can only log today\'s task.' });
//     }

//     let entry = await TaskEntry.findOne({ user: req.user._id, task: taskId, date });
//     if (!entry) {
//       entry = new TaskEntry({ user: req.user._id, task: taskId, date, completed: true });
//     } else {
//       entry.completed = !entry.completed;
//     }
//     await entry.save();

//     res.json({ success: true, data: entry });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const getTaskStats = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const entries = await TaskEntry.find({ user: req.user._id, task: taskId }).sort({ date: -1 });

//     let streak = 0;
//     let today = new Date().toISOString().split('T')[0];
//     let checkDate = new Date(today);
//     for (let i = 0; i < entries.length; i++) {
//       const entryDate = entries[i].date;
//       if (entryDate === checkDate.toISOString().split('T')[0] && entries[i].completed) {
//         streak++;
//         checkDate.setDate(checkDate.getDate() - 1);
//       } else {
//         break;
//       }
//     }

//     const totalCompleted = entries.filter(e => e.completed).length;

//     res.json({ success: true, data: { streak, totalCompleted } });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ========== Overview (all tasks with entries for a month) ==========
// export const getTasksWithEntries = async (req, res) => {
//   try {
//     const { year, month } = req.query; // month 1-12
//     const start = `${year}-${String(month).padStart(2, '0')}-01`;
//     const end = new Date(year, month, 0).toISOString().split('T')[0];

//     const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
//     const entries = await TaskEntry.find({
//       user: req.user._id,
//       date: { $gte: start, $lte: end }
//     });

//     const entriesMap = {};
//     entries.forEach(entry => {
//       if (!entriesMap[entry.task]) entriesMap[entry.task] = {};
//       entriesMap[entry.task][entry.date] = entry.completed;
//     });

//     const result = tasks.map(task => ({
//       ...task.toObject(),
//       entries: entriesMap[task._id] || {}
//     }));

//     res.json({ success: true, data: result });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ========== Completions for Log (with date filter) ==========
// export const getAllCompletions = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
//     const query = { user: req.user._id, completed: true };
//     if (startDate && endDate) {
//       const start = new Date(startDate + 'T00:00:00.000Z');
//       const end = new Date(endDate + 'T23:59:59.999Z');
//       // If you store the date as a string (YYYY-MM-DD) in a `date` field, use:
//       query.date = { $gte: startDate, $lte: endDate };
//       // If you store a Date object in `completedAt`, use:
//       // query.completedAt = { $gte: start, $lte: end };
//     }

//     const completions = await TaskEntry.find(query)
//       .populate('task', 'name scheduledTime')
//       .sort({ date: -1, task: 1 });

//     const formatted = completions.map(entry => ({
//       id: entry._id,
//       taskName: entry.task?.name || 'Unknown',
//       date: entry.date,
//       time: entry.task?.scheduledTime || '',
//     }));

//     res.json({ success: true, data: formatted });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// // Get all entries for a task for a full year
// export const getEntriesForYear = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const { year } = req.query;
//     const start = `${year}-01-01`;
//     const end = `${year}-12-31`;
//     const entries = await TaskEntry.find({
//       user: req.user._id,
//       task: taskId,
//       date: { $gte: start, $lte: end }
//     });
//     const entriesObj = {};
//     entries.forEach(e => entriesObj[e.date] = e.completed);
//     res.json({ success: true, data: entriesObj });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };








import Task from '../models/Task.js';
import TaskEntry from '../models/TaskEntry.js';

// ========== Required Indexes (add in schemas) ==========
// Task: { user: 1, createdAt: -1 }
// TaskEntry: { user: 1, task: 1, date: 1 } unique
// TaskEntry: { user: 1, date: 1, completed: 1 }
// TaskEntry: { user: 1, task: 1, completed: 1, date: -1 }

// ========== Task CRUD ==========
export const getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [tasks, totalCount] = await Promise.all([
      Task.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments({ user: req.user._id })
    ]);

    res.json({
      success: true,
      data: tasks,
      pagination: { page, limit, total: totalCount, pages: Math.ceil(totalCount / limit) }
    });
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
    const task = new Task({ user: req.user._id, name, scheduledTime, color });
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
    const updateData = {};
    if (name) updateData.name = name;
    if (scheduledTime) updateData.scheduledTime = scheduledTime;
    if (color) updateData.color = color;

    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $set: updateData },
      { new: true, lean: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
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
    // Delete all entries for this task in background (fire-and-forget)
    TaskEntry.deleteMany({ task: id }).catch(err => console.error('Failed to delete entries:', err));
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== Task Entries ==========
export const getEntriesForMonth = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'year and month are required' });
    }
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = new Date(year, month, 0).toISOString().split('T')[0];

    const entries = await TaskEntry.find({
      user: req.user._id,
      task: taskId,
      date: { $gte: start, $lte: end }
    })
      .sort({ date: 1 })
      .limit(100) // max 31 days anyway, but safe
      .lean();

    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleEntry = async (req, res) => {
  try {
    const { taskId, date } = req.params;
    const today = new Date().toISOString().split('T')[0];
    if (date !== today) {
      return res.status(400).json({ success: false, message: 'You can only log today\'s task.' });
    }

    // ✅ Atomic toggle using $bit (XOR) for boolean
    // Since MongoDB doesn't have boolean XOR, we use $bit with xor 1 (true/false)
    // But simpler: use $set with $cond in aggregation pipeline.
    // Alternative: use findOneAndUpdate with upsert and toggle via $set and $cond
    const entry = await TaskEntry.findOneAndUpdate(
      { user: req.user._id, task: taskId, date },
      [
        {
          $set: {
            completed: { $eq: [false, '$completed'] } // flip boolean
          }
        }
      ],
      { upsert: true, new: true, lean: true }
    );

    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Optimized streak calculation using aggregation (last consecutive completions)
export const getTaskStats = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    // Get all completed entries for this task, sorted by date descending
    const completions = await TaskEntry.find({
      user: userId,
      task: taskId,
      completed: true
    })
      .sort({ date: -1 })
      .select('date')
      .lean();

    // Calculate streak: find consecutive days from today backwards
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date(today);
    for (let i = 0; i < completions.length; i++) {
      const entryDate = completions[i].date;
      const checkDateStr = checkDate.toISOString().split('T')[0];
      if (entryDate === checkDateStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const totalCompleted = completions.length;

    res.json({ success: true, data: { streak, totalCompleted } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== Overview (all tasks with entries for a month) ==========
// Optimized with aggregation (single DB call)
export const getTasksWithEntries = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'year and month are required' });
    }
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0);
    const end = endDate.toISOString().split('T')[0];

    const aggregation = await Task.aggregate([
      { $match: { user: req.user._id } },
      {
        $lookup: {
          from: 'taskentries', // collection name (usually plural lowercase)
          let: { taskId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$task', '$$taskId'] },
                user: req.user._id,
                date: { $gte: start, $lte: end }
              }
            },
            { $project: { date: 1, completed: 1, _id: 0 } }
          ],
          as: 'entriesList'
        }
      },
      {
        $addFields: {
          entries: {
            $arrayToObject: {
              $map: {
                input: '$entriesList',
                as: 'entry',
                in: { k: '$$entry.date', v: '$$entry.completed' }
              }
            }
          }
        }
      },
      { $project: { entriesList: 0 } },
      { $sort: { createdAt: -1 } },
      { $limit: 200 } // safety limit
    ]);

    res.json({ success: true, data: aggregation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== Completions for Log (with date filter and pagination) ==========
export const getAllCompletions = async (req, res) => {
  try {
    let { startDate, endDate, page = 1, limit = 50 } = req.query;
    page = parseInt(page);
    limit = Math.min(parseInt(limit), 200);
    const skip = (page - 1) * limit;

    const query = { user: req.user._id, completed: true };
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else {
      // default last 90 days
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 90);
      query.date = {
        $gte: start.toISOString().slice(0, 10),
        $lte: end.toISOString().slice(0, 10)
      };
    }

    const [completions, totalCount] = await Promise.all([
      TaskEntry.find(query)
        .populate('task', 'name scheduledTime')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TaskEntry.countDocuments(query)
    ]);

    const formatted = completions.map(entry => ({
      id: entry._id,
      taskName: entry.task?.name || 'Unknown',
      date: entry.date,
      time: entry.task?.scheduledTime || '',
    }));

    res.json({
      success: true,
      data: formatted,
      pagination: { page, limit, total: totalCount, pages: Math.ceil(totalCount / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all entries for a task for a full year (optimized with lean, limit 366 days)
export const getEntriesForYear = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({ success: false, message: 'year is required' });
    }
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;

    const entries = await TaskEntry.find({
      user: req.user._id,
      task: taskId,
      date: { $gte: start, $lte: end }
    })
      .lean()
      .limit(366); // max days in a year + safety

    const entriesObj = {};
    entries.forEach(e => entriesObj[e.date] = e.completed);
    res.json({ success: true, data: entriesObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};