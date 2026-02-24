import PrayerEntry from '../models/PrayerEntry.js';
import User from '../models/User.js';

// Get all entries for user
export const getPrayerBook = async (req, res) => {
  try {
    const entries = await PrayerEntry.find({ user: req.user._id }).sort({ date: -1 });
    res.json({ success: true, data: { entries, streak: req.user.streak } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a prayer for a specific date
export const updatePrayer = async (req, res) => {
  try {
    const { date, prayer, value } = req.body;
    const userId = req.user._id;

    let entry = await PrayerEntry.findOne({ user: userId, date });
    if (!entry) {
      entry = new PrayerEntry({ user: userId, date, prayers: {} });
    }

    entry.prayers[prayer] = value;
    await entry.save();

    // Update streak logic
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      // Check if all prayers are offered today
      const allOffered = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].every(p => entry.prayers[p] === true);
      if (allOffered) {
        // Check if last prayer date was yesterday
        const lastDate = req.user.lastPrayerDate ? new Date(req.user.lastPrayerDate).toISOString().split('T')[0] : null;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        let newStreak = req.user.streak;
        if (lastDate === yesterday) {
          newStreak += 1;
        } else if (lastDate !== today) {
          newStreak = 1; // reset or start new streak
        }
        req.user.streak = newStreak;
        req.user.lastPrayerDate = new Date();
        await req.user.save();
      }
    }

    res.json({ success: true, data: { streak: req.user.streak } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get stats for a specific month/year
export const getMonthlyStats = async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const entries = await PrayerEntry.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    });

    const prayerCounts = { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
    const missedPrayers = { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
    let offered = 0;
    let missed = 0;
    const dailyCounts = {};

    entries.forEach(entry => {
      let dayOffered = 0;
      ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(p => {
        if (entry.prayers[p]) {
          prayerCounts[p]++;
          offered++;
          dayOffered++;
        } else {
          missedPrayers[p]++;
          missed++;
        }
      });
      dailyCounts[entry.date] = dayOffered;
    });

    const totalDays = entries.length;
    const completionRate = totalDays ? ((offered / (totalDays * 5)) * 100).toFixed(1) : 0;

    const mostOffered = Object.keys(prayerCounts).reduce((a, b) => prayerCounts[a] > prayerCounts[b] ? a : b, 'Fajr');
    const mostMissed = Object.keys(missedPrayers).reduce((a, b) => missedPrayers[a] > missedPrayers[b] ? a : b, 'Fajr');
    const bestDay = Object.keys(dailyCounts).reduce((a, b) => dailyCounts[a] > dailyCounts[b] ? a : b, null);

    res.json({
      success: true,
      data: {
        offered,
        missed,
        completionRate,
        totalDays,
        mostOffered: prayerCounts[mostOffered] > 0 ? mostOffered : '-',
        mostMissed: missedPrayers[mostMissed] > 0 ? mostMissed : '-',
        bestDay,
        prayerCounts,
        missedPrayers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get today's prayers
export const getTodayPrayers = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let entry = await PrayerEntry.findOne({ user: req.user._id, date: today });
    if (!entry) {
      entry = new PrayerEntry({
        user: req.user._id,
        date: today,
        prayers: { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false }
      });
      await entry.save();
    }
    res.json(entry.prayers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update today's prayers (bulk update)
export const updateTodayPrayers = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const updates = req.body;
    const entry = await PrayerEntry.findOneAndUpdate(
      { user: req.user._id, date: today },
      { prayers: updates },
      { new: true, upsert: true }
    );
    res.json(entry.prayers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};