// import { toHijri } from 'hijri-converter';

// export const getHijriDate = (date = new Date()) => {
//   const hijri = toHijri(date.getFullYear(), date.getMonth() + 1, date.getDate());
//   return `${hijri.hDay} ${hijri.hMonthName} ${hijri.hYear} AH`;
// };



import cron from 'node-cron';
import User from '../models/User.js';
import PrayerEntry from '../models/PrayerEntry.js';
import { sendStreakMilestoneEmail, sendPrayerReminderEmail } from './emailService.js';

const getMilestones = () => {
  const milestones = [50, 100];
  let next = 200;
  while (next <= 10000) {
    milestones.push(next);
    next *= 2;
  }
  return milestones;
};

// Run every day at 10:00 PM
cron.schedule('0 22 * * *', async () => {
  console.log('Running streak milestone & reminder cron job...');
  const today = new Date().toISOString().split('T')[0];
  const milestones = getMilestones();
  const BATCH_SIZE = 200;   // Process 200 users per batch
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    // 1️⃣ Fetch a batch of verified users (only needed fields, lean)
    const users = await User.find({ isVerified: true })
      .select('_id email name streak lastMilestoneNotified')
      .lean()
      .skip(skip)
      .limit(BATCH_SIZE);

    if (users.length === 0) {
      hasMore = false;
      break;
    }

    const userIds = users.map(u => u._id);

    // 2️⃣ Fetch all prayer entries for today for these users (single query)
    const prayerEntries = await PrayerEntry.find({
      user: { $in: userIds },
      date: today
    }).select('user prayers').lean();

    // Create a map for quick lookup
    const prayerMap = new Map();
    prayerEntries.forEach(entry => {
      prayerMap.set(entry.user.toString(), entry.prayers);
    });

    const milestoneUpdates = []; // For bulk write
    const usersForMilestoneEmail = [];

    // 3️⃣ Process each user in the batch (without extra queries)
    for (const user of users) {
      const userIdStr = user._id.toString();
      const streak = user.streak || 0;
      const lastNotified = user.lastMilestoneNotified || 0;

      // ---- Milestone check ----
      const newMilestones = milestones.filter(m => m <= streak && m > lastNotified);
      if (newMilestones.length > 0) {
        const highest = Math.max(...newMilestones);
        usersForMilestoneEmail.push({ user, highest });
        milestoneUpdates.push({
          updateOne: {
            filter: { _id: user._id },
            update: { $set: { lastMilestoneNotified: highest } }
          }
        });
      }

      // ---- Reminder for streak ≥30 with incomplete prayers ----
      if (streak >= 30) {
        const prayers = prayerMap.get(userIdStr);
        const completed = prayers
          ? prayers.Fajr && prayers.Dhuhr && prayers.Asr && prayers.Maghrib && prayers.Isha
          : false;

        if (!completed) {
          // Fire-and-forget email (don't await)
          sendPrayerReminderEmail(user.email, user.name, streak).catch(err =>
            console.error(`Reminder email failed for ${user.email}:`, err)
          );
        }
      }
    }

    // 4️⃣ Send milestone emails (fire-and-forget)
    for (const { user, highest } of usersForMilestoneEmail) {
      sendStreakMilestoneEmail(user.email, user.name, highest).catch(err =>
        console.error(`Milestone email failed for ${user.email}:`, err)
      );
    }

    // 5️⃣ Bulk update milestone fields in DB
    if (milestoneUpdates.length > 0) {
      await User.bulkWrite(milestoneUpdates);
    }

    skip += BATCH_SIZE;
    console.log(`Processed batch ${skip / BATCH_SIZE} (${skip} users so far)`);
  }

  console.log('Cron job completed');
});

// (Optional) keep the helper function if needed
export const getHijriDate = (date = new Date()) => {
  const { toHijri } = require('hijri-converter');
  const hijri = toHijri(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return `${hijri.hDay} ${hijri.hMonthName} ${hijri.hYear} AH`;
};