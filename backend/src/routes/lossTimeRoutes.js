const express = require('express');
const router = express.Router();
const {
  getLossTimes,
  getLossTimeById,
  createLossTime,
  updateLossTime,
  deleteLossTime
} = require('../controllers/lossTimeController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getLossTimes)
  .post(protect, authorize('ADMIN'), createLossTime);

router.route('/:id')
  .get(protect, getLossTimeById)
  .put(protect, authorize('ADMIN'), updateLossTime)
  .delete(protect, authorize('ADMIN'), deleteLossTime);

module.exports = router;
