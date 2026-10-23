const express = require('express');
const router = express.Router();
const {
  getSpareParts,
  getSparePartById,
  createSparePart,
  updateSparePart,
  deleteSparePart,
  updateQuantity,
  getLowStockParts
} = require('../controllers/sparePartController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getSpareParts)
  .post(protect, authorize('manager'), createSparePart);

router.route('/low-stock')
  .get(protect, getLowStockParts);

router.route('/:id')
  .get(protect, getSparePartById)
  .put(protect, authorize('manager'), updateSparePart)
  .delete(protect, authorize('manager'), deleteSparePart);

router.route('/:id/quantity')
  .patch(protect, updateQuantity);

module.exports = router;
