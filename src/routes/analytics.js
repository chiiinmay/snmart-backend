const express = require('express');
const router = express.Router();
const { trackEvent, getDashboard, getTopSymptoms } = require('../controllers/analyticsController');
const { optionalAuth, auth } = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/track', optionalAuth, trackEvent);
router.get('/admin/dashboard', auth, admin, getDashboard);
router.get('/admin/symptoms', auth, admin, getTopSymptoms);

module.exports = router;
