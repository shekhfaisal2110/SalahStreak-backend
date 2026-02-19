import cron from 'node-cron';
import User from '../models/User.js';
import PrayerEntry from '../models/PrayerEntry.js';
import { sendMissedPrayerNotification } from './emailService.js';

cron.schedule('0 20 * * *', async () => {
  console.log('Running missed prayer notification cron job...');
  const today = new Date().toISOString().split('T')[0];
  const users = await User.find({ isVerified: true });

  for (const user of users) {
    const entry = await PrayerEntry.findOne({ user: user._id, date: today });
    if (!entry) continue;

    const missed = [];
    for (const prayer of ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']) {
      if (!entry.prayers[prayer]) missed.push(prayer);
    }

    if (missed.length > 0) {
      await sendMissedPrayerNotification(user.email, user.name, missed);
    }
  }
});