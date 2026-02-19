require('dotenv').config();
const mongoose = require('mongoose');
const RamzanSchedule = require('./models/RamzanSchedule');

const schedules = [];
// Generate 30 days, assuming Ramzan starts on March 1, 2025 (example)
const startDate = new Date('2025-03-01');
for (let i = 0; i < 30; i++) {
  const date = new Date(startDate);
  date.setDate(startDate.getDate() + i);
  schedules.push({
    day: i + 1,
    ramzanDate: `${i+1}st Ramzan`, // simplify
    gregorianDate: date,
    sehriEnds: '04:30 AM', // dummy
    iftarTime: '06:45 PM'   // dummy
  });
}

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    await RamzanSchedule.deleteMany({});
    await RamzanSchedule.insertMany(schedules);
    console.log('Seeded Ramzan schedule');
    process.exit();
  });