const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  getSettingByKey
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getSettings)
  .put(protect, authorize('ADMIN'), updateSettings);

router.route('/:key')
  .get(protect, getSettingByKey);

module.exports = router;
