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

// @desc    Create new mekanik
// @route   POST /api/mekaniks
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { nama_mekanik, machine_code, machine_name, target_ohe, benchmark_ohe } = req.body;
    
    const mekanik = await Mekanik.create({
      nama_mekanik,
      machine_code,
      machine_name,
      target_ohe: target_ohe || 85,
      benchmark_ohe: benchmark_ohe || 90
    });

    res.status(201).json({
      success: true,
      data: mekanik
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update mekanik
// @route   PUT /api/mekaniks/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const mekanik = await Mekanik.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!mekanik) {
      return res.status(404).json({
        success: false,
        message: 'Mekanik not found'
      });
    }

    res.json({
      success: true,
      data: mekanik
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Delete mekanik (soft delete by setting status to inactive)
// @route   DELETE /api/mekaniks/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const mekanik = await Mekanik.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!mekanik) {
      return res.status(404).json({
        success: false,
        message: 'Mekanik not found'
      });
    }

    res.json({
      success: true,
      message: 'Mekanik deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
