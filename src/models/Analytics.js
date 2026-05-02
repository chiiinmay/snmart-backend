const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: String,
  eventType: {
    type: String,
    enum: ['page_view', 'product_view', 'add_to_cart', 'purchase', 'symptom_search', 'blog_view'],
    required: true,
    index: true
  },
  eventData: {
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    symptoms: [String],
    aiRecommendations: [mongoose.Schema.Types.ObjectId],
    page: String,
    amount: Number,
    blogId: mongoose.Schema.Types.ObjectId,
    blogTitle: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  ipAddress: String,
  userAgent: String
});

// TTL index — auto-delete after 1 year
analyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

module.exports = mongoose.model('Analytics', analyticsSchema);
