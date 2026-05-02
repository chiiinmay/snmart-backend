const Product = require('../models/Product');
const { getProductRecommendations, chatWithAssistant } = require('../services/aiService');

// @desc    Get AI product recommendations based on symptoms
// @route   POST /api/ai/recommend
exports.recommend = async (req, res) => {
  try {
    let { symptoms } = req.body;

    // Accept both string and array formats
    if (typeof symptoms === 'string') {
      symptoms = symptoms.split(/[,]+/).map(s => s.trim()).filter(Boolean);
      if (symptoms.length === 0) symptoms = [req.body.symptoms];
    }

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one symptom'
      });
    }

    const allProducts = await Product.find({ isActive: true });
    const recommendations = await getProductRecommendations(symptoms, allProducts);

    res.json({ success: true, ...recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const response = await chatWithAssistant(message, conversationHistory);

    res.json({ success: true, ...response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
