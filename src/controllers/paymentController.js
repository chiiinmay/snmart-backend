const { createOrder, verifyPayment } = require('../services/paymentService');

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const order = await createOrder(amount);

    res.json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify payment
// @route   POST /api/payment/verify
exports.verifyPaymentSignature = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    const isValid = verifyPayment(orderId, paymentId, signature);

    if (isValid) {
      res.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
