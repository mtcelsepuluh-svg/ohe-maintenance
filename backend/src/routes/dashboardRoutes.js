const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getDashboardStats,
  getOHEAnalysis
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getDashboard);

router.route('/stats')
  .get(protect, getDashboardStats);

router.route('/analysis')
  .get(protect, getOHEAnalysis);

module.exports = router;
