const Analytics = require('../models/Analytics');

const trackEvent = async (req, res, next) => {
  try {
    const { eventType, eventData } = req.body;

    await Analytics.create({
      userId: req.user ? req.user._id : null,
      sessionId: req.sessionID || req.headers['x-session-id'],
      eventType,
      eventData,
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    next();
  } catch (error) {
    // Don't block request if tracking fails
    console.error('Tracking error:', error.message);
    next();
  }
};

module.exports = trackEvent;
