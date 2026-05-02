const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/', auth, createOrder);
router.get('/', auth, getMyOrders);
router.get('/:id', auth, getOrder);

// Admin routes
router.get('/admin/all', auth, admin, getAllOrders);
router.put('/:id/status', auth, admin, updateOrderStatus);

module.exports = router;
