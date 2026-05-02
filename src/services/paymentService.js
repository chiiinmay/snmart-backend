const razorpay = require('../config/razorpay');
const crypto = require('crypto');

async function createOrder(amount, currency = 'INR') {
  const options = {
    amount: Math.round(amount * 100), // Convert to paise
    currency,
    receipt: `receipt_${Date.now()}`,
    payment_capture: 1
  };

  return await razorpay.orders.create(options);
}

function verifyPayment(orderId, paymentId, signature) {
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}

module.exports = { createOrder, verifyPayment };
