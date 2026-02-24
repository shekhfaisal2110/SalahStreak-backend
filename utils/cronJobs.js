import cron from 'node-cron';
import User from '../models/User.js';
import PrayerEntry from '../models/PrayerEntry.js';
import { sendStreakMilestoneEmail, sendPrayerReminderEmail } from './emailService.js';

// Generate milestone list: 50, 100, then double each time
const getMilestones = () => {
  const milestones = [50, 100];
  let next = 200;
  while (next <= 10000) { // reasonable upper bound
    milestones.push(next);
    next *= 2;
  }
  return milestones;
};

// Run every day at 10:00 PM
cron.schedule('0 22 * * *', async () => {
  console.log('Running streak milestone & reminder cron job...');
  const today = new Date().toISOString().split('T')[0];
  const users = await User.find({ isVerified: true });

  for (const user of users) {
    try {
      const streak = user.streak || 0;

      // ---- Milestone notifications ----
      const milestones = getMilestones();
      const newMilestones = milestones.filter(m => m <= streak && m > user.lastMilestoneNotified);
      if (newMilestones.length > 0) {
        const highest = Math.max(...newMilestones);
        await sendStreakMilestoneEmail(user.email, user.name, highest);
        user.lastMilestoneNotified = highest;
        await user.save();
        console.log(`Milestone email sent to ${user.email} for ${highest} days`);
      }

      // ---- Reminder for users with streak ≥30 who haven't completed today's prayers ----
      if (streak >= 30) {
        const prayerEntry = await PrayerEntry.findOne({ user: user._id, date: today });
        const completed = prayerEntry
          ? prayerEntry.prayers.Fajr && prayerEntry.prayers.Dhuhr && prayerEntry.prayers.Asr && prayerEntry.prayers.Maghrib && prayerEntry.prayers.Isha
          : false;

        if (!completed) {
          await sendPrayerReminderEmail(user.email, user.name, streak);
          console.log(`Reminder email sent to ${user.email} for incomplete prayers`);
        }
      }
    } catch (error) {
      console.error(`Error processing user ${user.email}:`, error);
    }
  }
});