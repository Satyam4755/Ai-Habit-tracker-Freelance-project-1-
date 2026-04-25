const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth); 

router.get('/', analyticsController.getAnalytics);

module.exports = router;
