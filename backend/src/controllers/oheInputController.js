const OHEInput = require('../models/OHEInput');
const OHECalculator = require('../utils/OHECalculator');
const Log = require('../models/Log');

// @desc    Get all OHE inputs
// @route   GET /api/oheinputs
// @access  Private
const getOHEInputs = async (req, res) => {
  try {
    const { date, nama, kategori_pekerjaan, startDate, endDate, month } = req.query;

    let query = {};

    if (date) query.date = new Date(date);
    if (nama) query.nama = nama;
    if (kategori_pekerjaan) query.kategori_pekerjaan = kategori_pekerjaan;
    
    // Filter by month (format: YYYY-MM)
    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // If user is MEKANIK, only show their data
    if (req.user.role === 'MEKANIK') {
      query.nama = req.user.name;
    }

    const oheInputs = await OHEInput.find(query)
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: oheInputs.length,
      data: oheInputs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single OHE input
// @route   GET /api/oheinputs/:id
// @access  Private
const getOHEInputById = async (req, res) => {
  try {
    const oheInput = await OHEInput.findById(req.params.id);
    
    if (!oheInput) {
      return res.status(404).json({ 
        success: false,
        message: 'OHE input not found' 
      });
    }
    
    // Check if MEKANIK is authorized
    if (req.user.role === 'MEKANIK' && oheInput.mekanik !== req.user.name) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }
    
    res.json({
      success: true,
      data: oheInput
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Create OHE input
// @route   POST /api/oheinputs
// @access  Private
const createOHEInput = async (req, res) => {
  try {
    // Validate required fields
    const required = ['date', 'nama', 'jenis_pekerjaan', 'kategori_pekerjaan', 'jam_mulai', 'jam_selesai'];
    for (const field of required) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `Field ${field} is required`
        });
      }
    }

    // Validate times
    if (req.body.jam_mulai && req.body.jam_selesai) {
      const startTime = new Date(`2000-01-01 ${req.body.jam_mulai}`);
      const endTime = new Date(`2000-01-01 ${req.body.jam_selesai}`);

      if (endTime <= startTime) {
        return res.status(400).json({
          success: false,
          message: 'Jam selesai harus lebih besar dari jam mulai'
        });
      }
    }

    // Calculate actual time if not provided
    if (!req.body.actual_time_min) {
      req.body.actual_time_min = OHECalculator.calculateWorkTime({
        start_time: req.body.jam_mulai,
        end_time: req.body.jam_selesai
      });
    }

    // Validate actual time
    if (req.body.actual_time_min < 0) {
      return res.status(400).json({
        success: false,
        message: 'Actual time cannot be negative'
      });
    }

    // Check if MEKANIK is authorized
    if (req.user.role === 'MEKANIK' && req.body.nama !== req.user.name) {
      return res.status(403).json({
        success: false,
        message: 'You can only create OHE input for yourself'
      });
    }

    // Generate record_id
    const record_id = await OHEInput.generateRecordId();

    const oheInput = await OHEInput.create({
      ...req.body,
      record_id,
      created_by: req.user.user_id
    });

    // Log activity
    await Log.create({
      user: req.user.user_id,
      action: 'input_ohe',
      module: 'ohe_input',
      reference_id: record_id,
      description: `Created OHE input: ${oheInput.jenis_pekerjaan} (${oheInput.actual_time_min} min)`
    });

    res.status(201).json({
      success: true,
      data: oheInput
    });
  } catch (error) {
    console.error('Create OHE error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update OHE input
// @route   PUT /api/oheinputs/:id
// @access  Private
const updateOHEInput = async (req, res) => {
  try {
    let oheInput = await OHEInput.findById(req.params.id);
    
    if (!oheInput) {
      return res.status(404).json({ 
        success: false,
        message: 'OHE input not found' 
      });
    }
    
    // Check if MEKANIK is authorized
    if (req.user.role === 'MEKANIK' && oheInput.mekanik !== req.user.name) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this record' 
      });
    }

    // Recalculate actual time if times changed
    if (req.body.start_time && req.body.end_time) {
      req.body.actual_time_min = OHECalculator.calculateWorkTime({
        start_time: req.body.start_time,
        end_time: req.body.end_time
      });
    }

    oheInput = await OHEInput.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Log activity
    await Log.create({
      user: req.user.user_id,
      action: 'update',
      module: 'ohe_input',
      reference_id: oheInput.record_id,
      description: `Updated OHE input: ${oheInput.activity_name}`
    });
    
    res.json({
      success: true,
      data: oheInput
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Delete OHE input
// @route   DELETE /api/oheinputs/:id
// @access  Private/Admin
const deleteOHEInput = async (req, res) => {
  try {
    const oheInput = await OHEInput.findById(req.params.id);
    
    if (!oheInput) {
      return res.status(404).json({ 
        success: false,
        message: 'OHE input not found' 
      });
    }
    
    await oheInput.deleteOne();

    // Log activity
    await Log.create({
      user: req.user.user_id,
      action: 'delete',
      module: 'ohe_input',
      reference_id: oheInput.record_id,
      description: `Deleted OHE input: ${oheInput.activity_name}`
    });
    
    res.json({
      success: true,
      message: 'OHE input removed'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get OHE summary for date range
// @route   GET /api/oheinputs/summary
// @access  Private
const getOHESummary = async (req, res) => {
  try {
    const { startDate, endDate, mekanik, shift } = req.query;
    
    let query = {};
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (mekanik) query.mekanik = mekanik;
    if (shift) query.shift = shift;

    // If user is MEKANIK, only show their data
    if (req.user.role === 'MEKANIK') {
      query.mekanik = req.user.name;
    }

    const oheInputs = await OHEInput.find(query);

    // Calculate summary using OHECalculator
    const summary = OHECalculator.calculateOHESummary(oheInputs);

    res.json({
      success: true,
      data: {
        ...summary,
        total_records: oheInputs.length,
        period: {
          start: startDate,
          end: endDate
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  getOHEInputs,
  getOHEInputById,
  createOHEInput,
  updateOHEInput,
  deleteOHEInput,
  getOHESummary
};
