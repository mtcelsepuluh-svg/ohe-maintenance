const express = require('express');
const router = express.Router();
const {
  syncFromGoogleSheets,
  getSyncStatus,
  getSyncHistory,
  getGoogleFormOptions,
  testConnection
} = require('../controllers/googleSyncController');
const { protect, authorize } = require('../middleware/auth');

// Apply protect middleware to all routes
router.use(protect);

// Test connection (Admin only)
router.get('/test', authorize('ADMIN'), testConnection);

// Sync data from Google Sheets (Admin only)
router.post('/sync', authorize('ADMIN'), syncFromGoogleSheets);

// Get sync status
router.get('/status', getSyncStatus);

// Get sync history (Admin only)
router.get('/history', authorize('ADMIN'), getSyncHistory);

// Get Google Form options (for dropdowns)
router.get('/options', getGoogleFormOptions);

module.exports = router;
