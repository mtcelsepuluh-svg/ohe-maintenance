const express = require('express');
const router = express.Router();
const {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
} = require('../controllers/equipmentController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getEquipment)
  .post(protect, authorize('manager'), createEquipment);

router.route('/:id')
  .get(protect, getEquipmentById)
  .put(protect, authorize('manager'), updateEquipment)
  .delete(protect, authorize('manager'), deleteEquipment);

module.exports = router;
