// import cron from 'node-cron';
// import User from '../models/User.js';
// import PrayerEntry from '../models/PrayerEntry.js';
// import { sendStreakMilestoneEmail, sendPrayerReminderEmail } from './emailService.js';

// // Generate milestone list: 50, 100, then double each time
// const getMilestones = () => {
//   const milestones = [50, 100];
//   let next = 200;
//   while (next <= 10000) { // reasonable upper bound
//     milestones.push(next);
//     next *= 2;
//   }
//   return milestones;
// };

// // Run every day at 10:00 PM
// cron.schedule('0 22 * * *', async () => {
//   console.log('Running streak milestone & reminder cron job...');
//   const today = new Date().toISOString().split('T')[0];
//   const users = await User.find({ isVerified: true });

//   for (const user of users) {
//     try {
//       const streak = user.streak || 0;

//       // ---- Milestone notifications ----
//       const milestones = getMilestones();
//       const newMilestones = milestones.filter(m => m <= streak && m > user.lastMilestoneNotified);
//       if (newMilestones.length > 0) {
//         const highest = Math.max(...newMilestones);
//         await sendStreakMilestoneEmail(user.email, user.name, highest);
//         user.lastMilestoneNotified = highest;
//         await user.save();
//         console.log(`Milestone email sent to ${user.email} for ${highest} days`);
//       }

//       // ---- Reminder for users with streak ≥30 who haven't completed today's prayers ----
//       if (streak >= 30) {
//         const prayerEntry = await PrayerEntry.findOne({ user: user._id, date: today });
//         const completed = prayerEntry
//           ? prayerEntry.prayers.Fajr && prayerEntry.prayers.Dhuhr && prayerEntry.prayers.Asr && prayerEntry.prayers.Maghrib && prayerEntry.prayers.Isha
//           : false;

//         if (!completed) {
//           await sendPrayerReminderEmail(user.email, user.name, streak);
//           console.log(`Reminder email sent to ${user.email} for incomplete prayers`);
//         }
//       }
//     } catch (error) {
//       console.error(`Error processing user ${user.email}:`, error);
//     }
//   }
// });





import cron from 'node-cron';
import User from '../models/User.js';
import PrayerEntry from '../models/PrayerEntry.js';
import { sendStreakMilestoneEmail, sendPrayerReminderEmail } from './emailService.js';

// Generate milestone list: 50, 100, then double each time
const getMilestones = () => {
  const milestones = [50, 100];
  let next = 200;
  while (next <= 10000) {
    milestones.push(next);
    next *= 2;
  }
  return milestones;
};

// ✅ Run every day at 10:00 PM
cron.schedule('0 22 * * *', async () => {
  console.log('Running streak milestone & reminder cron job...');
  const today = new Date().toISOString().split('T')[0];
  const milestones = getMilestones();
  const batchSize = 100; // Process users in batches
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    // ✅ Paginate users: fetch only needed fields (lean)
    const users = await User.find({ isVerified: true })
      .select('_id email name streak lastMilestoneNotified')
      .lean()
      .skip(skip)
      .limit(batchSize);

    if (users.length === 0) {
      hasMore = false;
      break;
    }

    const userIds = users.map(u => u._id);
    
    // ✅ Batch fetch all prayer entries for today for these users
    const prayerEntries = await PrayerEntry.find({
      user: { $in: userIds },
      date: today
    }).select('user prayers').lean();
    
    const prayerMap = new Map();
    prayerEntries.forEach(entry => {
      prayerMap.set(entry.user.toString(), entry.prayers);
    });

    // Arrays for bulk updates (milestone updates)
    const milestoneUpdates = []; // { id, newMilestone }
    const usersToProcess = [];

    for (const user of users) {
      const userIdStr = user._id.toString();
      const streak = user.streak || 0;
      let updated = false;

      // ---- Milestone notifications ----
      const newMilestones = milestones.filter(m => m <= streak && m > (user.lastMilestoneNotified || 0));
      if (newMilestones.length > 0) {
        const highest = Math.max(...newMilestones);
        // Send email (fire and forget, don't await inside loop)
        sendStreakMilestoneEmail(user.email, user.name, highest).catch(err => 
          console.error(`Milestone email failed for ${user.email}:`, err)
        );
        milestoneUpdates.push({ id: user._id, highest });
        updated = true;
      }

      // ---- Reminder for users with streak ≥30 who haven't completed today's prayers ----
      if (streak >= 30) {
        const prayers = prayerMap.get(userIdStr);
        const completed = prayers
          ? prayers.Fajr && prayers.Dhuhr && prayers.Asr && prayers.Maghrib && prayers.Isha
          : false;
        
        if (!completed) {
          // Send reminder email (fire and forget)
          sendPrayerReminderEmail(user.email, user.name, streak).catch(err =>
            console.error(`Reminder email failed for ${user.email}:`, err)
          );
          // No DB update needed
        }
      }

      if (updated) {
        usersToProcess.push({ id: user._id, highest: milestoneUpdates[milestoneUpdates.length-1]?.highest });
      }
    }

    // ✅ Bulk update milestone fields
    if (usersToProcess.length > 0) {
      const bulkOps = usersToProcess.map(u => ({
        updateOne: {
          filter: { _id: u.id },
          update: { $set: { lastMilestoneNotified: u.highest } }
        }
      }));
      await User.bulkWrite(bulkOps);
    }

    skip += batchSize;
    console.log(`Processed batch ${skip / batchSize}, total processed: ${skip}`);
  }

  console.log('Cron job completed');
});