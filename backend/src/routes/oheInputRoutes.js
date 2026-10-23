const express = require('express');
const router = express.Router();
const {
  getOHEInputs,
  getOHEInputById,
  createOHEInput,
  updateOHEInput,
  deleteOHEInput,
  getOHESummary
} = require('../controllers/oheInputController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getOHEInputs)
  .post(protect, createOHEInput);

router.route('/summary')
  .get(protect, getOHESummary);

router.route('/:id')
  .get(protect, getOHEInputById)
  .put(protect, updateOHEInput)
  .delete(protect, authorize('ADMIN'), deleteOHEInput);

module.exports = router;
