const ValueTimeList = require('../models/ValueTimeList');
const Log = require('../models/Log');

// @desc    Get all Value Time activities
// @route   GET /api/valuetimes
// @access  Private
const getValueTimes = async (req, res) => {
  try {
    const { sub_category, status, search } = req.query;
    
    let query = {};
    
    if (sub_category) query.sub_category = sub_category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { activity_name: { $regex: search, $options: 'i' } },
        { activity_code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const valueTimes = await ValueTimeList.find(query).sort({ activity_code: 1 });
    
    res.json({
      success: true,
      count: valueTimes.length,
      data: valueTimes
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get single Value Time activity
// @route   GET /api/valuetimes/:id
// @access  Private
const getValueTimeById = async (req, res) => {
  try {
    const valueTime = await ValueTimeList.findById(req.params.id);
    
    if (!valueTime) {
      return res.status(404).json({ 
        success: false,
        message: 'Value Time activity not found' 
      });
    }
    
    res.json({
      success: true,
      data: valueTime
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Create Value Time activity
// @route   POST /api/valuetimes
// @access  Private/Admin
const createValueTime = async (req, res) => {
  try {
    const valueTime = await ValueTimeList.create(req.body);

    // Log activity
    await Log.create({
      user: req.user.user_id,
      action: 'create',
      module: 'value_time',
      reference_id: valueTime.activity_code,
      description: `Created Value Time activity: ${valueTime.activity_name}`
    });

    res.status(201).json({
      success: true,
      data: valueTime
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

// @desc    Update Value Time activity
// @route   PUT /api/valuetimes/:id
// @access  Private/Admin
const updateValueTime = async (req, res) => {
  try {
    const valueTime = await ValueTimeList.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!valueTime) {
      return res.status(404).json({ 
        success: false,
        message: 'Value Time activity not found' 
      });
    }

    // Log activity
    await Log.create({
      user: req.user.user_id,
      action: 'update',
      module: 'value_time',
      reference_id: valueTime.activity_code,
      description: `Updated Value Time activity: ${valueTime.activity_name}`
    });
    
    res.json({
      success: true,
      data: valueTime
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Delete Value Time activity
// @route   DELETE /api/valuetimes/:id
// @access  Private/Admin
const deleteValueTime = async (req, res) => {
  try {
    const valueTime = await ValueTimeList.findById(req.params.id);
    
    if (!valueTime) {
      return res.status(404).json({ 
        success: false,
        message: 'Value Time activity not found' 
      });
    }
    
    await valueTime.deleteOne();

    // Log activity
    await Log.create({
      user: req.user.user_id,
      action: 'delete',
      module: 'value_time',
      reference_id: valueTime.activity_code,
      description: `Deleted Value Time activity: ${valueTime.activity_name}`
    });
    
    res.json({
      success: true,
      message: 'Value Time activity removed'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  getValueTimes,
  getValueTimeById,
  createValueTime,
  updateValueTime,
  deleteValueTime
};
