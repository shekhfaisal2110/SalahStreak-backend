import { PageView, Event } from '../models/Analytics.js';
import PDFDocument from 'pdfkit';
import { UAParser } from 'ua-parser-js';
import { generateAnalyticsReportPDF } from '../utils/pdfGeneratorAnalytics.js';

export const recordPageView = async (req, res) => {
  try {
    const { route } = req.body;
    const userId = req.user?._id || null;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const pageView = new PageView({ userId, route, ip, userAgent });
    await pageView.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recordEvent = async (req, res) => {
  try {
    const { eventType, metadata } = req.body;
    const userId = req.user?._id || null;
    const event = new Event({ userId, eventType, metadata });
    await event.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Event save error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnalyticsSummary = async (req, res) => {
  try {
    const totalPageViews = await PageView.countDocuments();
    const totalEvents = await Event.countDocuments();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const routeStats = await PageView.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$route', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const dailyViews = await PageView.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: { totalPageViews, totalEvents, routeStats, dailyViews }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDailyViewsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    if (startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00.000Z');
      const end = new Date(endDate + 'T23:59:59.999Z');
      query.timestamp = { $gte: start, $lte: end };
    }
    const dailyViews = await PageView.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
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

export const getDeviceBreakdown = async (req, res) => {
  try {
    const pageViews = await PageView.find().lean();
    const counts = { Desktop: 0, Mobile: 0, Tablet: 0 };
    pageViews.forEach(pv => {
      const ua = pv.userAgent || '';
      const parser = new UAParser(ua);
      const device = parser.getDevice().type || 'desktop';
      if (device === 'mobile') counts.Mobile++;
      else if (device === 'tablet') counts.Tablet++;
      else counts.Desktop++;
    });
    const data = [
      { name: 'Desktop', value: counts.Desktop },
      { name: 'Mobile', value: counts.Mobile },
      { name: 'Tablet', value: counts.Tablet },
    ].filter(d => d.value > 0);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserTypes = async (req, res) => {
  try {
    const uniqueUsers = await PageView.distinct('userId');
    const registeredCount = uniqueUsers.filter(id => id != null).length;
    const data = [{ name: 'Registered Users', value: registeredCount }];
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateAnalyticsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    if (startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00.000Z');
      const end = new Date(endDate + 'T23:59:59.999Z');
      query.timestamp = { $gte: start, $lte: end };
    }

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
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const rangeDays = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    const groupByMonth = rangeDays > 60;
    let rows;
    if (groupByMonth) {
      const monthly = await PageView.aggregate([
        { $match: query },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$timestamp' } },
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