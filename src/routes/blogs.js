const express = require('express');
const router = express.Router();
const { getBlogs, getBlog, createBlog, updateBlog, deleteBlog, getAllBlogs } = require('../controllers/blogController');
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', getBlogs);
router.get('/:slug', getBlog);

// Admin routes
router.post('/', auth, admin, createBlog);
router.put('/:id', auth, admin, updateBlog);
router.delete('/:id', auth, admin, deleteBlog);
router.get('/admin/all', auth, admin, getAllBlogs);

module.exports = router;
