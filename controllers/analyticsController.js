// import { PageView, Event } from '../models/Analytics.js';
// import { UAParser } from 'ua-parser-js';
// import { generateAnalyticsReportPDF } from '../utils/pdfGeneratorAnalytics.js';

// // ✅ Helper: default last 30 days range
// const getDefaultDateRange = () => {
//   const end = new Date();
//   const start = new Date();
//   start.setDate(start.getDate() - 30);
//   start.setHours(0, 0, 0, 0);
//   end.setHours(23, 59, 59, 999);
//   return { start, end };
// };

// // ✅ Record page view (with abuse protection)
// export const recordPageView = async (req, res) => {
//   try {
//     let { route, views = 1 } = req.body;
//     views = Math.min(Math.max(1, parseInt(views) || 1), 100); // max 100 per request

//     const userId = req.user?._id || null;
//     const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
//     const userAgent = req.headers['user-agent'];

//     const pageViews = Array.from({ length: views }, () => ({
//       userId, route, ip, userAgent,
//       timestamp: new Date()
//     }));

//     await PageView.insertMany(pageViews);
//     res.json({ success: true });
//   } catch (error) {
//     console.error('Error recording page views:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Record event
// export const recordEvent = async (req, res) => {
//   try {
//     const { eventType, metadata } = req.body;
//     const userId = req.user?._id || null;
//     await Event.create({ userId, eventType, metadata });
//     res.json({ success: true });
//   } catch (error) {
//     console.error('Event save error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Optimized summary using $facet (single aggregation)
// export const getAnalyticsSummary = async (req, res) => {
//   try {
//     let { startDate, endDate } = req.query;
//     let start, end;
//     if (startDate && endDate) {
//       start = new Date(startDate + 'T00:00:00.000Z');
//       end = new Date(endDate + 'T23:59:59.999Z');
//     } else {
//       const def = getDefaultDateRange();
//       start = def.start;
//       end = def.end;
//     }

//     const matchStage = { timestamp: { $gte: start, $lte: end } };

//     const [result] = await PageView.aggregate([
//       { $match: matchStage },
//       {
//         $facet: {
//           totalPageViews: [{ $count: 'count' }],
//           routeStats: [
//             { $group: { _id: '$route', count: { $sum: 1 } } },
//             { $sort: { count: -1 } },
//             { $limit: 20 }
//           ],
//           dailyViews: [
//             {
//               $group: {
//                 _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
//                 count: { $sum: 1 }
//               }
//             },
//             { $sort: { _id: 1 } }
//           ]
//         }
//       }
//     ]);

//     const totalEvents = await Event.countDocuments(matchStage);

//     res.json({
//       success: true,
//       data: {
//         totalPageViews: result.totalPageViews[0]?.count || 0,
//         totalEvents,
//         routeStats: result.routeStats,
//         dailyViews: result.dailyViews
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Daily views by date range (with defaults)
// export const getDailyViewsByDateRange = async (req, res) => {
//   try {
//     let { startDate, endDate } = req.query;
//     if (!startDate || !endDate) {
//       const def = getDefaultDateRange();
//       startDate = def.start.toISOString().slice(0, 10);
//       endDate = def.end.toISOString().slice(0, 10);
//     }
//     const start = new Date(startDate + 'T00:00:00.000Z');
//     const end = new Date(endDate + 'T23:59:59.999Z');

//     const dailyViews = await PageView.aggregate([
//       { $match: { timestamp: { $gte: start, $lte: end } } },
//       {
//         $group: {
//           _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { _id: 1 } }
//     ]);
//     res.json({ success: true, data: dailyViews });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Device breakdown – sample last 30 days and limit 10k records
// export const getDeviceBreakdown = async (req, res) => {
//   try {
//     let { startDate, endDate } = req.query;
//     if (!startDate || !endDate) {
//       const def = getDefaultDateRange();
//       startDate = def.start.toISOString().slice(0, 10);
//       endDate = def.end.toISOString().slice(0, 10);
//     }
//     const start = new Date(startDate + 'T00:00:00.000Z');
//     const end = new Date(endDate + 'T23:59:59.999Z');

//     // Fetch only userAgent field, limit to 10000 records for performance
//     const pageViews = await PageView.find(
//       { timestamp: { $gte: start, $lte: end } },
//       { userAgent: 1 }
//     ).limit(10000).lean();

//     const counts = { Desktop: 0, Mobile: 0, Tablet: 0 };
//     for (const pv of pageViews) {
//       const ua = pv.userAgent || '';
//       const parser = new UAParser(ua);
//       const device = parser.getDevice().type || 'desktop';
//       if (device === 'mobile') counts.Mobile++;
//       else if (device === 'tablet') counts.Tablet++;
//       else counts.Desktop++;
//     }

//     const data = [
//       { name: 'Desktop', value: counts.Desktop },
//       { name: 'Mobile', value: counts.Mobile },
//       { name: 'Tablet', value: counts.Tablet },
//     ].filter(d => d.value > 0);
//     res.json({ success: true, data });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ User types – optimized with aggregation and date range
// export const getUserTypes = async (req, res) => {
//   try {
//     let { startDate, endDate } = req.query;
//     if (!startDate || !endDate) {
//       const def = getDefaultDateRange();
//       startDate = def.start.toISOString().slice(0, 10);
//       endDate = def.end.toISOString().slice(0, 10);
//     }
//     const start = new Date(startDate + 'T00:00:00.000Z');
//     const end = new Date(endDate + 'T23:59:59.999Z');

//     const result = await PageView.aggregate([
//       { $match: { timestamp: { $gte: start, $lte: end } } },
//       {
//         $group: {
//           _id: null,
//           registeredUsers: { $addToSet: { $cond: [{ $ne: ['$userId', null] }, '$userId', null] } }
//         }
//       },
//       {
//         $project: {
//           registeredCount: { $size: { $setDifference: ['$registeredUsers', [null]] } }
//         }
//       }
//     ]);

//     const registeredCount = result[0]?.registeredCount || 0;
//     res.json({
//       success: true,
//       data: [{ name: 'Registered Users', value: registeredCount }]
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Generate PDF report (already okay, but added default range)
// export const generateAnalyticsReport = async (req, res) => {
//   try {
//     let { startDate, endDate } = req.query;
//     if (!startDate || !endDate) {
//       const def = getDefaultDateRange();
//       startDate = def.start.toISOString().slice(0, 10);
//       endDate = def.end.toISOString().slice(0, 10);
//     }
//     const start = new Date(startDate + 'T00:00:00.000Z');
//     const end = new Date(endDate + 'T23:59:59.999Z');
//     const query = { timestamp: { $gte: start, $lte: end } };

//     const totalPageViews = await PageView.countDocuments(query);
//     const totalEvents = await Event.countDocuments(query);

//     const uniqueRoutesData = await PageView.aggregate([
//       { $match: query },
//       { $group: { _id: '$route' } },
//       { $count: 'count' }
//     ]);
//     const uniqueRoutes = uniqueRoutesData[0]?.count || 0;

//     const dailyViews = await PageView.aggregate([
//       { $match: query },
//       {
//         $group: {
//           _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { _id: 1 } }
//     ]);

//     const rangeDays = (end - start) / (1000 * 60 * 60 * 24);
//     const groupByMonth = rangeDays > 60;
//     let rows;
//     if (groupByMonth) {
//       const monthly = await PageView.aggregate([
//         { $match: query },
//         {
//           $group: {
//             _id: { $dateToString: { format: '%Y-%m', date: '$timestamp' } },
//             count: { $sum: 1 }
//           }
//         },
//         { $sort: { _id: 1 } }
//       ]);
//       rows = monthly.map(item => ({ period: item._id, count: item.count }));
//     } else {
//       rows = dailyViews.map(item => ({ period: item._id, count: item.count }));
//     }

//     const pdfData = await generateAnalyticsReportPDF({
//       totalPageViews,
//       totalEvents,
//       uniqueRoutes,
//       rows,
//       groupByMonth
//     }, startDate, endDate);

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=analytics-report.pdf`);
//     res.send(pdfData);
//   } catch (error) {
//     console.error('Report generation error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


















import { PageView, Event } from '../models/Analytics.js';
import { UAParser } from 'ua-parser-js';
import { generateAnalyticsReportPDF } from '../utils/pdfGeneratorAnalytics.js';

// Helper: default last 30 days range (using Date objects)
const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Record multiple page views (with abuse protection)
export const recordPageView = async (req, res) => {
  try {
    let { route, views = 1 } = req.body;
    views = Math.min(Math.max(1, parseInt(views) || 1), 100); // max 100 per request

    const userId = req.user?._id || null;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const pageViews = Array.from({ length: views }, () => ({
      userId,
      route,
      ip,
      userAgent,
      // createdAt will be set automatically by timestamps: true
    }));

    // Use ordered: false for faster bulk insert (ignore duplicate errors)
    await PageView.insertMany(pageViews, { ordered: false });
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording page views:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Record a single event
export const recordEvent = async (req, res) => {
  try {
    const { eventType, metadata } = req.body;
    const userId = req.user?._id || null;
    await Event.create({ userId, eventType, metadata });
    res.json({ success: true });
  } catch (error) {
    console.error('Event save error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Optimized summary using $facet (single aggregation) – using createdAt
export const getAnalyticsSummary = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate + 'T00:00:00.000Z');
      end = new Date(endDate + 'T23:59:59.999Z');
    } else {
      const def = getDefaultDateRange();
      start = def.start;
      end = def.end;
    }

    const matchStage = { createdAt: { $gte: start, $lte: end } };

    const [result] = await PageView.aggregate([
      { $match: matchStage },
      {
        $facet: {
          totalPageViews: [{ $count: 'count' }],
          routeStats: [
            { $group: { _id: '$route', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
          ],
          dailyViews: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    const totalEvents = await Event.countDocuments(matchStage);

    res.json({
      success: true,
      data: {
        totalPageViews: result.totalPageViews[0]?.count || 0,
        totalEvents,
        routeStats: result.routeStats,
        dailyViews: result.dailyViews
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Daily views by date range (using createdAt)
export const getDailyViewsByDateRange = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      const def = getDefaultDateRange();
      startDate = def.start.toISOString().slice(0, 10);
      endDate = def.end.toISOString().slice(0, 10);
    }
    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T23:59:59.999Z');

    const dailyViews = await PageView.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json({ success: true, data: dailyViews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Device breakdown – sample last 30 days and limit 10k records (using createdAt)
export const getDeviceBreakdown = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      const def = getDefaultDateRange();
      startDate = def.start.toISOString().slice(0, 10);
      endDate = def.end.toISOString().slice(0, 10);
    }
    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T23:59:59.999Z');

    // Fetch only userAgent, limit to 10000 records for performance
    const pageViews = await PageView.find(
      { createdAt: { $gte: start, $lte: end } },
      { userAgent: 1 }
    ).limit(10000).lean();

    const counts = { Desktop: 0, Mobile: 0, Tablet: 0 };
    for (const pv of pageViews) {
      const ua = pv.userAgent || '';
      const parser = new UAParser(ua);
      const device = parser.getDevice().type || 'desktop';
      if (device === 'mobile') counts.Mobile++;
      else if (device === 'tablet') counts.Tablet++;
      else counts.Desktop++;
    }

    const data = [
      { name: 'Desktop', value: counts.Desktop },
      { name: 'Mobile', value: counts.Mobile },
      { name: 'Tablet', value: counts.Tablet },
    ].filter(d => d.value > 0);
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// User types – using createdAt
export const getUserTypes = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      const def = getDefaultDateRange();
      startDate = def.start.toISOString().slice(0, 10);
      endDate = def.end.toISOString().slice(0, 10);
    }
    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T23:59:59.999Z');

    const result = await PageView.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          registeredUsers: { $addToSet: { $cond: [{ $ne: ['$userId', null] }, '$userId', null] } }
        }
      },
      {
        $project: {
          registeredCount: { $size: { $setDifference: ['$registeredUsers', [null]] } }
        }
      }
    ]);

    const registeredCount = result[0]?.registeredCount || 0;
    res.json({
      success: true,
      data: [{ name: 'Registered Users', value: registeredCount }]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate PDF report – using createdAt
export const generateAnalyticsReport = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      const def = getDefaultDateRange();
      startDate = def.start.toISOString().slice(0, 10);
      endDate = def.end.toISOString().slice(0, 10);
    }
    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T23:59:59.999Z');
    const query = { createdAt: { $gte: start, $lte: end } };

    const totalPageViews = await PageView.countDocuments(query);
    const totalEvents = await Event.countDocuments(query);

    const uniqueRoutesData = await PageView.aggregate([
      { $match: query },
      { $group: { _id: '$route' } },
      { $count: 'count' }
    ]);
    const uniqueRoutes = uniqueRoutesData[0]?.count || 0;

    const dailyViews = await PageView.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const rangeDays = (end - start) / (1000 * 60 * 60 * 24);
    const groupByMonth = rangeDays > 60;
    let rows;
    if (groupByMonth) {
      const monthly = await PageView.aggregate([
        { $match: query },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      rows = monthly.map(item => ({ period: item._id, count: item.count }));
    } else {
      rows = dailyViews.map(item => ({ period: item._id, count: item.count }));
    }

    const pdfData = await generateAnalyticsReportPDF({
      totalPageViews,
      totalEvents,
      uniqueRoutes,
      rows,
      groupByMonth
    }, startDate, endDate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-report.pdf`);
    res.send(pdfData);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};