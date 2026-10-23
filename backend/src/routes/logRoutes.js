const express = require('express');
const router = express.Router();
const {
  getLogs,
  getLogsByUser
} = require('../controllers/logController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('ADMIN'), getLogs);

router.route('/user/:userId')
  .get(protect, getLogsByUser);

module.exports = router;
