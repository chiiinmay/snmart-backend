const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, getByCategory, createProduct,
  updateProduct, deleteProduct, incrementView, getCategories
} = require('../controllers/productController');
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', getProducts);
router.get('/categories/list', getCategories);
router.get('/category/:cat', getByCategory);
router.get('/:id', getProduct);
router.post('/:id/view', incrementView);

// Admin routes
router.post('/', auth, admin, createProduct);
router.put('/:id', auth, admin, updateProduct);
router.delete('/:id', auth, admin, deleteProduct);

module.exports = router;
