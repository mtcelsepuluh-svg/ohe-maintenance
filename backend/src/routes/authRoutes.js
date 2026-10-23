const express = require('express');
const router = express.Router();
const { 
  login, 
  getMe, 
  logout,
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Admin only routes
router.get('/users', protect, authorize('ADMIN'), getUsers);
router.post('/users', protect, authorize('ADMIN'), createUser);
router.put('/users/:id', protect, authorize('ADMIN'), updateUser);
router.delete('/users/:id', protect, authorize('ADMIN'), deleteUser);

module.exports = router;
