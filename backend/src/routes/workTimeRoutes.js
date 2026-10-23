const express = require('express');
const router = express.Router();
const {
  getWorkTimeSheet,
  getWorkTimeSheetById,
  createWorkTimeSheet,
  createBulkWorkTimeSheets,
  updateDailyEntry,
  addOvertime,
  markAbsence,
  deleteWorkTimeSheet,
  exportToExcel
} = require('../controllers/workTimeController');
const { protect, authorize } = require('../middleware/auth');

// Apply protect middleware to all routes
router.use(protect);

// Export to Excel
router.get('/:year/:month/export', authorize('ADMIN', 'MEKANIK'), exportToExcel);

// Get work time sheets by year/month
router.get('/:year/:month', getWorkTimeSheet);

// Get single work time sheet
router.get('/:id', getWorkTimeSheetById);

// Create new work time sheet (Admin only)
router.post('/', authorize('ADMIN'), createWorkTimeSheet);

// Create bulk work time sheets (Admin only)
router.post('/bulk', authorize('ADMIN'), createBulkWorkTimeSheets);

// Update daily entry
router.put('/:id/day/:date', updateDailyEntry);

// Add overtime
router.post('/:id/overtime', addOvertime);

// Mark absence
router.post('/:id/absence', markAbsence);

// Delete work time sheet (Admin only)
router.delete('/:id', authorize('ADMIN'), deleteWorkTimeSheet);

module.exports = router;
