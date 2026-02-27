// import PrayerEntry from '../models/PrayerEntry.js';
// import User from '../models/User.js';
// import Tasbeeh from '../models/Tasbeeh.js';


// // Get top 100 users by number of days with all prayers completed
// export const getAllDaysCompletedLeaderboard = async (req, res) => {
//   try {
//     const leaderboard = await PrayerEntry.aggregate([
//       {
//         $project: {
//           user: 1,
//           allCompleted: {
//             $and: [
//               "$prayers.Fajr",
//               "$prayers.Dhuhr",
//               "$prayers.Asr",
//               "$prayers.Maghrib",
//               "$prayers.Isha"
//             ]
//           }
//         }
//       },
//       { $match: { allCompleted: true } },
//       {
//         $group: {
//           _id: "$user",
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { count: -1 } },
//       { $limit: 100 },
//       {
//         $lookup: {
//           from: "users",
//           localField: "_id",
//           foreignField: "_id",
//           as: "userInfo"
//         }
//       },
//       { $unwind: "$userInfo" },
//       {
//         $project: {
//           _id: 0,
//           userId: "$_id",
//           name: "$userInfo.name",
//           email: "$userInfo.email",
//           count: 1
//         }
//       }
//     ]);

//     res.json({ success: true, data: leaderboard });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get top 100 users by current streak
// export const getStreakLeaderboard = async (req, res) => {
//   try {
//     const leaderboard = await User.find({ streak: { $gt: 0 } })
//       .sort({ streak: -1 })
//       .limit(100)
//       .select('name email streak');

//     res.json({ success: true, data: leaderboard });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // // Get logged-in user's rank in both categories
// // export const getUserRank = async (req, res) => {
// //   try {
// //     const userId = req.user._id;

// //     // All days completed rank
// //     const allDaysRankAgg = await PrayerEntry.aggregate([
// //       {
// //         $project: {
// //           user: 1,
// //           allCompleted: {
// //             $and: [
// //               "$prayers.Fajr",
// //               "$prayers.Dhuhr",
// //               "$prayers.Asr",
// //               "$prayers.Maghrib",
// //               "$prayers.Isha"
// //             ]
// //           }
// //         }
// //       },
// //       { $match: { allCompleted: true } },
// //       {
// //         $group: {
// //           _id: "$user",
// //           count: { $sum: 1 }
// //         }
// //       },
// //       { $sort: { count: -1 } }
// //     ]);

// //     const allDaysRank = allDaysRankAgg.findIndex(item => item._id.equals(userId)) + 1;

// //     // Streak rank
// //     const streakRank = await User.countDocuments({ streak: { $gt: req.user.streak } }) + 1;

// //     res.json({
// //       success: true,
// //       data: {
// //         allDaysRank: allDaysRank > 0 ? allDaysRank : null,
// //         streakRank
// //       }
// //     });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // Get top 100 users by total dhikr count (sum of currentCount across all tasbeehs)
// export const getTotalDhikrLeaderboard = async (req, res) => {
//   try {
//     const leaderboard = await Tasbeeh.aggregate([
//       {
//         $group: {
//           _id: "$user",
//           totalDhikr: { $sum: "$currentCount" }
//         }
//       },
//       { $sort: { totalDhikr: -1 } },
//       { $limit: 100 },
//       {
//         $lookup: {
//           from: "users",
//           localField: "_id",
//           foreignField: "_id",
//           as: "userInfo"
//         }
//       },
//       { $unwind: "$userInfo" },
//       {
//         $project: {
//           _id: 0,
//           userId: "$_id",
//           name: "$userInfo.name",
//           email: "$userInfo.email",
//           totalDhikr: 1
//         }
//       }
//     ]);

//     res.json({ success: true, data: leaderboard });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get logged-in user's rank in all categories
// export const getUserRank = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     // All days completed rank
//     const allDaysRankAgg = await PrayerEntry.aggregate([
//       {
//         $project: {
//           user: 1,
//           allCompleted: {
//             $and: [
//               "$prayers.Fajr",
//               "$prayers.Dhuhr",
//               "$prayers.Asr",
//               "$prayers.Maghrib",
//               "$prayers.Isha"
//             ]
//           }
//         }
//       },
//       { $match: { allCompleted: true } },
//       {
//         $group: {
//           _id: "$user",
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { count: -1 } }
//     ]);
//     const allDaysRank = allDaysRankAgg.findIndex(item => item._id.equals(userId)) + 1;

//     // Streak rank
//     const streakRank = await User.countDocuments({ streak: { $gt: req.user.streak } }) + 1;

//     // Total dhikr rank
//     const dhikrRankAgg = await Tasbeeh.aggregate([
//       {
//         $group: {
//           _id: "$user",
//           totalDhikr: { $sum: "$currentCount" }
//         }
//       },
//       { $sort: { totalDhikr: -1 } }
//     ]);
//     const dhikrRank = dhikrRankAgg.findIndex(item => item._id.equals(userId)) + 1;

//     res.json({
//       success: true,
//       data: {
//         allDaysRank: allDaysRank > 0 ? allDaysRank : null,
//         streakRank,
//         dhikrRank: dhikrRank > 0 ? dhikrRank : null
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };












import PrayerEntry from '../models/PrayerEntry.js';
import User from '../models/User.js';
import Tasbeeh from '../models/Tasbeeh.js';

// Get top 100 users by number of days with all prayers completed
export const getAllDaysCompletedLeaderboard = async (req, res) => {
  try {
    const leaderboard = await PrayerEntry.aggregate([
      {
        $project: {
          user: 1,
          allCompleted: {
            $and: [
              "$prayers.Fajr",
              "$prayers.Dhuhr",
              "$prayers.Asr",
              "$prayers.Maghrib",
              "$prayers.Isha"
            ]
          }
        }
      },
      { $match: { allCompleted: true } },
      {
        $group: {
          _id: "$user",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      // 🔥 Only include users who have chosen to show their rank
      { $match: { "userInfo.showRank": true } },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$userInfo.name",
          email: "$userInfo.email",
          count: 1
        }
      }
    ]);

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get top 100 users by current streak
export const getStreakLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({ streak: { $gt: 0 }, showRank: true }) // 👈 filter
      .sort({ streak: -1 })
      .limit(100)
      .select('name email streak');

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get top 100 users by total dhikr count
export const getTotalDhikrLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Tasbeeh.aggregate([
      {
        $group: {
          _id: "$user",
          totalDhikr: { $sum: "$currentCount" }
        }
      },
      { $sort: { totalDhikr: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      // 🔥 Only include users who have chosen to show their rank
      { $match: { "userInfo.showRank": true } },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$userInfo.name",
          email: "$userInfo.email",
          totalDhikr: 1
        }
      }
    ]);

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get logged-in user's rank (unfiltered – always returns the user's own rank)
export const getUserRank = async (req, res) => {
  try {
    const userId = req.user._id;

    // All days completed rank (consider all users, regardless of showRank)
    const allDaysRankAgg = await PrayerEntry.aggregate([
      {
        $project: {
          user: 1,
          allCompleted: {
            $and: [
              "$prayers.Fajr",
              "$prayers.Dhuhr",
              "$prayers.Asr",
              "$prayers.Maghrib",
              "$prayers.Isha"
            ]
          }
        }
      },
      { $match: { allCompleted: true } },
      {
        $group: {
          _id: "$user",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    const allDaysRank = allDaysRankAgg.findIndex(item => item._id.equals(userId)) + 1;

    // Streak rank (consider all users)
    const streakRank = await User.countDocuments({ streak: { $gt: req.user.streak } }) + 1;

    // Total dhikr rank
    const dhikrRankAgg = await Tasbeeh.aggregate([
      {
        $group: {
          _id: "$user",
          totalDhikr: { $sum: "$currentCount" }
        }
      },
      { $sort: { totalDhikr: -1 } }
    ]);
    const dhikrRank = dhikrRankAgg.findIndex(item => item._id.equals(userId)) + 1;

    res.json({
      success: true,
      data: {
        allDaysRank: allDaysRank > 0 ? allDaysRank : null,
        streakRank,
        dhikrRank: dhikrRank > 0 ? dhikrRank : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};