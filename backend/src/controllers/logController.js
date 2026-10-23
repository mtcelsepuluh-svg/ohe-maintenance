const Log = require('../models/Log');

// @desc    Get all logs
// @route   GET /api/logs
// @access  Private/Admin
const getLogs = async (req, res) => {
  try {
    const { user, action, module, startDate, endDate, limit = 100 } = req.query;
    
    let query = {};
    
    if (user) query.user = user;
    if (action) query.action = action;
    if (module) query.module = module;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get logs by user
// @route   GET /api/logs/user/:userId
// @access  Private
const getLogsByUser = async (req, res) => {
  try {
    const logs = await Log.find({ user: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  getLogs,
  getLogsByUser
};
