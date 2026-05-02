const SymptomRecommendation = require('../models/SymptomRecommendation');

// Try to use Anthropic if available, otherwise use rule-based fallback
let Anthropic;
try {
  Anthropic = require('@anthropic-ai/sdk');
} catch (e) {
  console.log('Anthropic SDK not available, using fallback recommendation engine');
}

async function getProductRecommendations(symptoms, allProducts) {
  // 1. Check cache first
  const cached = await SymptomRecommendation.findOne({
    symptoms: { $all: symptoms, $size: symptoms.length }
  }).populate('recommendedProducts');

  if (cached && cached.expiresAt > new Date()) {
    return JSON.parse(cached.aiResponse);
  }

  // 2. Try Claude API if key is available
  if (Anthropic && process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('placeholder')) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const productContext = allProducts.map(p => ({
        id: p._id,
        name: p.name,
        benefits: p.benefits,
        symptoms: p.symptoms,
        ingredients: p.ingredients,
        price: p.price,
        category: p.category
      }));

      const prompt = `You are an Ayurvedic product recommendation expert for Sri Nanjundeshwara Mart.

User Symptoms: ${symptoms.join(', ')}

Available Products:
${JSON.stringify(productContext, null, 2)}

Based on the user's symptoms, recommend the top 3-5 most suitable Ayurvedic products.
Consider traditional Ayurvedic principles and ingredient efficacy.

Respond ONLY in valid JSON format:
{
  "recommendations": [
    {
      "productId": "...",
      "productName": "...",
      "confidence": 0.95,
      "reasoning": "Why this product is suitable"
    }
  ],
  "generalAdvice": "Brief Ayurvedic lifestyle advice related to the symptoms"
}`;

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      });

      const response = JSON.parse(message.content[0].text);

      // Cache the result
      await SymptomRecommendation.create({
        symptoms,
        recommendedProducts: response.recommendations.map(r => r.productId),
        aiResponse: JSON.stringify(response),
        confidence: response.recommendations[0]?.confidence || 0.8,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      return response;
    } catch (error) {
      console.error('Claude API error, using fallback:', error.message);
    }
  }

  // 3. Fallback: Rule-based matching
  return getFallbackRecommendations(symptoms, allProducts);
}

function getFallbackRecommendations(symptoms, allProducts) {
  const lowerSymptoms = symptoms.map(s => s.toLowerCase());

  // Score products based on symptom matching
  const scored = allProducts.map(product => {
    let score = 0;
    const productSymptoms = (product.symptoms || []).map(s => s.toLowerCase());
    const productBenefits = (product.benefits || []).map(b => b.toLowerCase());
    const productName = product.name.toLowerCase();

    for (const symptom of lowerSymptoms) {
      // Direct symptom match
      if (productSymptoms.some(ps => ps.includes(symptom) || symptom.includes(ps))) {
        score += 3;
      }
      // Benefit match
      if (productBenefits.some(pb => pb.includes(symptom) || symptom.includes(pb))) {
        score += 2;
      }
      // Name match
      if (productName.includes(symptom)) {
        score += 1;
      }
    }

    return { product, score };
  });

  // Sort by score and take top 5
  const topProducts = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // If no matches, return popular products
  if (topProducts.length === 0) {
    const popular = allProducts
      .sort((a, b) => b.purchaseCount - a.purchaseCount)
      .slice(0, 3);

    return {
      recommendations: popular.map(p => ({
        productId: p._id,
        productName: p.name,
        confidence: 0.5,
        reasoning: 'Popular product that may help with general wellness'
      })),
      generalAdvice: 'Based on your symptoms, we recommend consulting with an Ayurvedic practitioner for personalized advice. Meanwhile, these popular products support overall wellness.'
    };
  }

  const maxScore = topProducts[0].score;
  return {
    recommendations: topProducts.map(({ product, score }) => ({
      productId: product._id,
      productName: product.name,
      confidence: Math.round((score / maxScore) * 100) / 100,
      reasoning: `Matches your symptoms based on ${product.symptoms?.length ? 'symptom profile' : 'product benefits'} and Ayurvedic properties.`
    })),
    generalAdvice: 'Ayurveda recommends a holistic approach. Along with these products, consider maintaining a balanced diet, regular exercise, and proper sleep for best results.'
  };
}

async function chatWithAssistant(message, conversationHistory = []) {
  if (Anthropic && process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('placeholder')) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: `You are a helpful Ayurvedic wellness assistant for Sri Nanjundeshwara Mart, an online Ayurvedic products store. 
You help customers understand Ayurvedic remedies, suggest products, and provide general wellness advice.
Always remind users that your advice is informational and they should consult a healthcare professional for medical conditions.
Keep responses concise, warm, and helpful.`,
        messages
      });

      return {
        reply: response.content[0].text,
        role: 'assistant'
      };
    } catch (error) {
      console.error('Claude chat error:', error.message);
    }
  }

  // Fallback response
  return {
    reply: `Thank you for your question about "${message}". While I'm currently in offline mode, I recommend browsing our product categories or using the symptom-based recommendation feature to find the right Ayurvedic products for you. For personalized advice, please contact us on WhatsApp!`,
    role: 'assistant'
  };
}

module.exports = { getProductRecommendations, chatWithAssistant };
