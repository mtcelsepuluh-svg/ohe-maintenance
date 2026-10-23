const express = require('express');
const router = express.Router();
const {
  getWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  getWorkOrderStats
} = require('../controllers/workOrderController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getWorkOrders)
  .post(protect, createWorkOrder);

router.route('/stats')
  .get(protect, getWorkOrderStats);

router.route('/:id')
  .get(protect, getWorkOrderById)
  .put(protect, updateWorkOrder)
  .delete(protect, authorize('manager'), deleteWorkOrder);

module.exports = router;
