const Analytics = require('../models/Analytics');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Track user event
// @route   POST /api/analytics/track
exports.trackEvent = async (req, res) => {
  try {
    const { eventType, eventData } = req.body;

    await Analytics.create({
      userId: req.user ? req.user._id : null,
      sessionId: req.headers['x-session-id'] || 'anonymous',
      eventType,
      eventData,
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true });
  } catch (error) {
    // Don't fail the request
    res.json({ success: true });
  }
};

// @desc    Get analytics dashboard data (Admin)
// @route   GET /api/admin/analytics
exports.getDashboard = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      recentOrders,
      topProducts,
      ordersByStatus,
      dailyRevenue
    ] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name email'),
      Product.find().sort({ purchaseCount: -1 }).limit(10).select('name purchaseCount viewCount price images'),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: 'completed' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalUsers,
        totalProducts,
        recentOrders,
        topProducts,
        ordersByStatus,
        dailyRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get top searched symptoms (Admin)
// @route   GET /api/admin/analytics/symptoms
exports.getTopSymptoms = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

    const symptoms = await Analytics.aggregate([
      {
        $match: {
          eventType: 'symptom_search',
          timestamp: { $gte: startDate }
        }
      },
      { $unwind: '$eventData.symptoms' },
      {
        $group: {
          _id: '$eventData.symptoms',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({ success: true, symptoms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
