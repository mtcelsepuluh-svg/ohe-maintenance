const express = require('express');
const router = express.Router();
const Mekanik = require('../models/Mekanik');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all mekaniks
// @route   GET /api/mekaniks
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const mekaniks = await Mekanik.find({ status: 'active' }).sort({ nama_mekanik: 1 });
    
    res.json({
      success: true,
      count: mekaniks.length,
      data: mekaniks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
