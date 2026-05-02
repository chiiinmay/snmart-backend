const express = require('express');
const router = express.Router();
const { createPaymentOrder, verifyPaymentSignature } = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

router.post('/create-order', auth, createPaymentOrder);
router.post('/verify', auth, verifyPaymentSignature);

module.exports = router;
