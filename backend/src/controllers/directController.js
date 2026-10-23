const DirectList = require('../models/DirectList');
const Log = require('../models/Log');

// @desc    Get all Direct activities
// @route   GET /api/directs
// @access  Private
const getDirects = async (req, res) => {
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

    const directs = await DirectList.find(query).sort({ activity_code: 1 });
    
    res.json({
      success: true,
      count: directs.length,
      data: directs
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get single Direct activity
// @route   GET /api/directs/:id
// @access  Private
const getDirectById = async (req, res) => {
  try {
    const direct = await DirectList.findById(req.params.id);
    
    if (!direct) {
      return res.status(404).json({ 
        success: false,
        message: 'Direct activity not found' 
      });
    }
    
    res.json({
      success: true,
      data: direct
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Create Direct activity
// @route   POST /api/directs
// @access  Private/Admin
const createDirect = async (req, res) => {
  try {
    const direct = await DirectList.create(req.body);

    await Log.create({
      user: req.user.user_id,
      action: 'create',
      module: 'direct',
      reference_id: direct.activity_code,
      description: `Created Direct activity: ${direct.activity_name}`
    });

    res.status(201).json({
      success: true,
      data: direct
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

// @desc    Update Direct activity
// @route   PUT /api/directs/:id
// @access  Private/Admin
const updateDirect = async (req, res) => {
  try {
    const direct = await DirectList.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!direct) {
      return res.status(404).json({ 
        success: false,
        message: 'Direct activity not found' 
      });
    }

    await Log.create({
      user: req.user.user_id,
      action: 'update',
      module: 'direct',
      reference_id: direct.activity_code,
      description: `Updated Direct activity: ${direct.activity_name}`
    });
    
    res.json({
      success: true,
      data: direct
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Delete Direct activity
// @route   DELETE /api/directs/:id
// @access  Private/Admin
const deleteDirect = async (req, res) => {
  try {
    const direct = await DirectList.findById(req.params.id);
    
    if (!direct) {
      return res.status(404).json({ 
        success: false,
        message: 'Direct activity not found' 
      });
    }
    
    await direct.deleteOne();

    await Log.create({
      user: req.user.user_id,
      action: 'delete',
      module: 'direct',
      reference_id: direct.activity_code,
      description: `Deleted Direct activity: ${direct.activity_name}`
    });
    
    res.json({
      success: true,
      message: 'Direct activity removed'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  getDirects,
  getDirectById,
  createDirect,
  updateDirect,
  deleteDirect
};
