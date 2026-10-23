const IndirectList = require('../models/IndirectList');
const Log = require('../models/Log');

// @desc    Get all Indirect activities
// @route   GET /api/indirects
// @access  Private
const getIndirects = async (req, res) => {
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

    const indirects = await IndirectList.find(query).sort({ activity_code: 1 });
    
    res.json({
      success: true,
      count: indirects.length,
      data: indirects
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get single Indirect activity
// @route   GET /api/indirects/:id
// @access  Private
const getIndirectById = async (req, res) => {
  try {
    const indirect = await IndirectList.findById(req.params.id);
    
    if (!indirect) {
      return res.status(404).json({ 
        success: false,
        message: 'Indirect activity not found' 
      });
    }
    
    res.json({
      success: true,
      data: indirect
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Create Indirect activity
// @route   POST /api/indirects
// @access  Private/Admin
const createIndirect = async (req, res) => {
  try {
    const indirect = await IndirectList.create(req.body);

    await Log.create({
      user: req.user.user_id,
      action: 'create',
      module: 'indirect',
      reference_id: indirect.activity_code,
      description: `Created Indirect activity: ${indirect.activity_name}`
    });

    res.status(201).json({
      success: true,
      data: indirect
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

// @desc    Update Indirect activity
// @route   PUT /api/indirects/:id
// @access  Private/Admin
const updateIndirect = async (req, res) => {
  try {
    const indirect = await IndirectList.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!indirect) {
      return res.status(404).json({ 
        success: false,
        message: 'Indirect activity not found' 
      });
    }

    await Log.create({
      user: req.user.user_id,
      action: 'update',
      module: 'indirect',
      reference_id: indirect.activity_code,
      description: `Updated Indirect activity: ${indirect.activity_name}`
    });
    
    res.json({
      success: true,
      data: indirect
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Delete Indirect activity
// @route   DELETE /api/indirects/:id
// @access  Private/Admin
const deleteIndirect = async (req, res) => {
  try {
    const indirect = await IndirectList.findById(req.params.id);
    
    if (!indirect) {
      return res.status(404).json({ 
        success: false,
        message: 'Indirect activity not found' 
      });
    }
    
    await indirect.deleteOne();

    await Log.create({
      user: req.user.user_id,
      action: 'delete',
      module: 'indirect',
      reference_id: indirect.activity_code,
      description: `Deleted Indirect activity: ${indirect.activity_name}`
    });
    
    res.json({
      success: true,
      message: 'Indirect activity removed'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  getIndirects,
  getIndirectById,
  createIndirect,
  updateIndirect,
  deleteIndirect
};
