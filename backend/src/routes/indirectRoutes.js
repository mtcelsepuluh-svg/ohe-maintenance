const express = require('express');
const router = express.Router();
const {
  getIndirects,
  getIndirectById,
  createIndirect,
  updateIndirect,
  deleteIndirect
} = require('../controllers/indirectController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getIndirects)
  .post(protect, authorize('ADMIN'), createIndirect);

router.route('/:id')
  .get(protect, getIndirectById)
  .put(protect, authorize('ADMIN'), updateIndirect)
  .delete(protect, authorize('ADMIN'), deleteIndirect);

module.exports = router;
