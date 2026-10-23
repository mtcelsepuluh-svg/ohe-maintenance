const express = require('express');
const router = express.Router();
const {
  getValueTimes,
  getValueTimeById,
  createValueTime,
  updateValueTime,
  deleteValueTime
} = require('../controllers/valueTimeController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getValueTimes)
  .post(protect, authorize('ADMIN'), createValueTime);

router.route('/:id')
  .get(protect, getValueTimeById)
  .put(protect, authorize('ADMIN'), updateValueTime)
  .delete(protect, authorize('ADMIN'), deleteValueTime);

module.exports = router;
