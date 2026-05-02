const express = require('express');
const router = express.Router();
const { recommend, chat } = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/auth');

router.post('/recommend', optionalAuth, recommend);
router.post('/chat', optionalAuth, chat);

module.exports = router;
