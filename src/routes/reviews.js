const express = require('express');
const router = express.Router();
const { getProductReviews, submitReview, getAllReviews, updateReview, deleteReview } = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public
router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', submitReview);

// Admin
router.get('/admin/all', auth, admin, getAllReviews);
router.put('/:id', auth, admin, updateReview);
router.delete('/:id', auth, admin, deleteReview);

module.exports = router;
