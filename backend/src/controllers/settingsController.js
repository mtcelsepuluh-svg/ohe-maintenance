const Settings = require('../models/Settings');
const Log = require('../models/Log');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.find({});
    
    // Convert to key-value object
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    res.json({
      success: true,
      data: settingsObj
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    
    // Update each setting
    for (const [key, value] of Object.entries(updates)) {
      await Settings.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
    }

    // Log activity
    await Log.create({
      user: req.user.user_id,
      action: 'change_master',
      module: 'settings',
      description: `Updated application settings`
    });
    
    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get single setting
// @route   GET /api/settings/:key
// @access  Private
const getSettingByKey = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    
    if (!setting) {
      return res.status(404).json({ 
        success: false,
        message: 'Setting not found' 
      });
    }
    
    res.json({
      success: true,
      data: {
        key: setting.key,
        value: setting.value,
        description: setting.description
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
  getSettings,
  updateSettings,
  getSettingByKey
};
