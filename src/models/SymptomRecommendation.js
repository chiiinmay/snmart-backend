const mongoose = require('mongoose');

const symptomRecommendationSchema = new mongoose.Schema({
  symptoms: {
    type: [String],
    required: true,
    index: true
  },
  recommendedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  confidence: Number,
  aiResponse: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
});

// TTL index for auto-deletion
symptomRecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('SymptomRecommendation', symptomRecommendationSchema);
