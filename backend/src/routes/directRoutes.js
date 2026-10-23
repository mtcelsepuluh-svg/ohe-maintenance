const express = require('express');
const router = express.Router();
const {
  getDirects,
  getDirectById,
  createDirect,
  updateDirect,
  deleteDirect
} = require('../controllers/directController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getDirects)
  .post(protect, authorize('ADMIN'), createDirect);

router.route('/:id')
  .get(protect, getDirectById)
  .put(protect, authorize('ADMIN'), updateDirect)
  .delete(protect, authorize('ADMIN'), deleteDirect);

module.exports = router;
