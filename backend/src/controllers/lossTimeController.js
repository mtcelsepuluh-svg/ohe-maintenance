const LossTimeList = require('../models/LossTimeList');
const Log = require('../models/Log');

// @desc    Get all Loss Time activities
// @route   GET /api/losstimes
// @access  Private
const getLossTimes = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { activity_name: { $regex: search, $options: 'i' } },
        { activity_code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const lossTimes = await LossTimeList.find(query).sort({ activity_code: 1 });
    
    res.json({
      success: true,
      count: lossTimes.length,
      data: lossTimes
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get single Loss Time activity
// @route   GET /api/losstimes/:id
// @access  Private
const getLossTimeById = async (req, res) => {
  try {
    const lossTime = await LossTimeList.findById(req.params.id);
    
    if (!lossTime) {
      return res.status(404).json({ 
        success: false,
        message: 'Loss Time activity not found' 
      });
    }
    
    res.json({
      success: true,
      data: lossTime
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Create Loss Time activity
// @route   POST /api/losstimes
// @access  Private/Admin
const createLossTime = async (req, res) => {
  try {
    const lossTime = await LossTimeList.create(req.body);

    await Log.create({
      user: req.user.user_id,
      action: 'create',
      module: 'loss_time',
      reference_id: lossTime.activity_code,
      description: `Created Loss Time activity: ${lossTime.activity_name}`
    });

    res.status(201).json({
      success: true,
      data: lossTime
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Activity code already exists' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Update Loss Time activity
// @route   PUT /api/losstimes/:id
// @access  Private/Admin
const updateLossTime = async (req, res) => {
  try {
    const lossTime = await LossTimeList.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!lossTime) {
      return res.status(404).json({ 
        success: false,
        message: 'Loss Time activity not found' 
      });
    }

    await Log.create({
      user: req.user.user_id,
      action: 'update',
      module: 'loss_time',
      reference_id: lossTime.activity_code,
      description: `Updated Loss Time activity: ${lossTime.activity_name}`
    });
    
    res.json({
      success: true,
      data: lossTime
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Delete Loss Time activity
// @route   DELETE /api/losstimes/:id
// @access  Private/Admin
const deleteLossTime = async (req, res) => {
  try {
    const lossTime = await LossTimeList.findById(req.params.id);
    
    if (!lossTime) {
      return res.status(404).json({ 
        success: false,
        message: 'Loss Time activity not found' 
      });
    }
    
    await lossTime.deleteOne();

    await Log.create({
      user: req.user.user_id,
      action: 'delete',
      module: 'loss_time',
      reference_id: lossTime.activity_code,
      description: `Deleted Loss Time activity: ${lossTime.activity_name}`
    });
    
    res.json({
      success: true,
      message: 'Loss Time activity removed'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  getLossTimes,
  getLossTimeById,
  createLossTime,
  updateLossTime,
  deleteLossTime
};
