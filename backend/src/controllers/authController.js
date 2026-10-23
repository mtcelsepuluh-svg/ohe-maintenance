const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Log = require('../models/Log');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Login user with PIN
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { user_id, pin } = req.body;

    // Validate input
    if (!user_id || !pin) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide user_id and pin' 
      });
    }

    // Check for user
    const user = await User.findOne({ user_id }).select('+pin');

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check if user is active
    if (user.status === 'inactive') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Check PIN
    const isMatch = await bcrypt.compare(pin, user.pin);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Log login activity
    await Log.create({
      user: user.user_id,
      action: 'login',
      module: 'auth',
      description: `User ${user.name} logged in`
    });

    res.json({
      success: true,
      _id: user._id,
      user_id: user.user_id,
      name: user.name,
      role: user.role,
      machine: user.machine,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Log logout activity
    await Log.create({
      user: req.user.user_id,
      action: 'logout',
      module: 'auth',
      description: `User ${req.user.name} logged out`
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-pin').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Create user
// @route   POST /api/auth/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { user_id, pin, name, role, machine, status } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ user_id });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID already exists' 
      });
    }

    // Hash PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    // Create user
    const user = await User.create({
      user_id,
      pin: hashedPin,
      name,
      role,
      machine,
      status: status || 'active'
    });

    // Log activity
    await Log.create({
      user: req.user.user_id,
      action: 'create',
      module: 'user',
      reference_id: user.user_id,
      description: `Created user ${user.name}`
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Update user
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { pin, ...updateData } = req.body;

    // If PIN is being updated, hash it
    if (pin) {
      updateData.pin = await bcrypt.hash(pin, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Log activity
    await Log.create({
      user: req.user.user_id,
      action: 'update',
      module: 'user',
      reference_id: user.user_id,
      description: `Updated user ${user.name}`
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    await user.deleteOne();

    // Log activity
    await Log.create({
      user: req.user.user_id,
      action: 'delete',
      module: 'user',
      reference_id: user.user_id,
      description: `Deleted user ${user.name}`
    });

    res.json({
      success: true,
      message: 'User removed'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = { 
  login, 
  getMe, 
  logout,
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser 
};
