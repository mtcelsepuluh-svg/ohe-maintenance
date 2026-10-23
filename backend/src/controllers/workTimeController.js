const WorkTimeSheet = require('../models/WorkTimeSheet');
const User = require('../models/User');

// @desc    Get work time sheet by month/year
// @route   GET /api/worktime/:year/:month
// @access  Private
const getWorkTimeSheet = async (req, res) => {
  try {
    const { year, month } = req.params;
    const { personel_id } = req.query;

    let query = { year: parseInt(year), month: parseInt(month) };
    
    if (personel_id) {
      query.personel_id = personel_id;
    }

    const sheets = await WorkTimeSheet.find(query)
      .populate('personel_id', 'user_id name role machine')
      .sort({ personel_name: 1 });

    // Calculate summary per day
    const summary = calculateDailySummary(sheets);

    res.status(200).json({
      success: true,
      count: sheets.length,
      data: sheets,
      summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching work time sheets',
      error: error.message
    });
  }
};

// @desc    Get single work time sheet
// @route   GET /api/worktime/:id
// @access  Private
const getWorkTimeSheetById = async (req, res) => {
  try {
    const sheet = await WorkTimeSheet.findById(req.params.id)
      .populate('personel_id', 'user_id name role machine');

    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: 'Work time sheet not found'
      });
    }

    res.status(200).json({
      success: true,
      data: sheet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching work time sheet',
      error: error.message
    });
  }
};

// @desc    Create new work time sheet
// @route   POST /api/worktime
// @access  Private (Admin only)
const createWorkTimeSheet = async (req, res) => {
  try {
    const { personel_id, month, year } = req.body;

    // Check if sheet already exists
    const existingSheet = await WorkTimeSheet.findOne({
      personel_id,
      month: parseInt(month),
      year: parseInt(year)
    });

    if (existingSheet) {
      return res.status(400).json({
        success: false,
        message: 'Work time sheet already exists for this personel and month'
      });
    }

    // Get personel details
    const personel = await User.findById(personel_id);
    if (!personel) {
      return res.status(404).json({
        success: false,
        message: 'Personel not found'
      });
    }

    // Generate monthly sheet
    const sheetData = WorkTimeSheet.generateMonthlySheet(
      personel_id,
      personel.name,
      parseInt(month),
      parseInt(year),
      req.user.user_id
    );

    const sheet = await WorkTimeSheet.create(sheetData);

    res.status(201).json({
      success: true,
      data: sheet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating work time sheet',
      error: error.message
    });
  }
};

// @desc    Create work time sheets for all active personels
// @route   POST /api/worktime/bulk
// @access  Private (Admin only)
const createBulkWorkTimeSheets = async (req, res) => {
  try {
    const { month, year } = req.body;

    // Get all active mekaniks
    const personels = await User.find({
      role: 'MEKANIK',
      status: 'active'
    });

    const results = {
      created: 0,
      skipped: 0,
      errors: []
    };

    for (const personel of personels) {
      try {
        // Check if sheet already exists
        const existingSheet = await WorkTimeSheet.findOne({
          personel_id: personel._id,
          month: parseInt(month),
          year: parseInt(year)
        });

        if (existingSheet) {
          results.skipped++;
          continue;
        }

        // Generate monthly sheet
        const sheetData = WorkTimeSheet.generateMonthlySheet(
          personel._id,
          personel.name,
          parseInt(month),
          parseInt(year),
          req.user.user_id
        );

        await WorkTimeSheet.create(sheetData);
        results.created++;
      } catch (error) {
        results.errors.push({
          personel: personel.name,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${results.created} sheets, skipped ${results.skipped}`,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating bulk work time sheets',
      error: error.message
    });
  }
};

// @desc    Update daily entry
// @route   PUT /api/worktime/:id/day/:date
// @access  Private
const updateDailyEntry = async (req, res) => {
  try {
    const { id, date } = req.params;
    const updates = req.body;

    const sheet = await WorkTimeSheet.findById(id);

    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: 'Work time sheet not found'
      });
    }

    const entry = sheet.updateDailyEntry(parseInt(date), updates);

    await sheet.save();

    res.status(200).json({
      success: true,
      data: entry,
      total_monthly: sheet.total_monthly
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating daily entry',
      error: error.message
    });
  }
};

// @desc    Add overtime to specific day
// @route   POST /api/worktime/:id/overtime
// @access  Private
const addOvertime = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, overtime_minutes, is_manual } = req.body;

    const sheet = await WorkTimeSheet.findById(id);

    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: 'Work time sheet not found'
      });
    }

    const entry = sheet.addOvertime(parseInt(date), overtime_minutes, is_manual);

    await sheet.save();

    res.status(200).json({
      success: true,
      data: entry,
      total_monthly: sheet.total_monthly
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding overtime',
      error: error.message
    });
  }
};

// @desc    Mark absence
// @route   POST /api/worktime/:id/absence
// @access  Private
const markAbsence = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, absence_type, remarks } = req.body;

    const sheet = await WorkTimeSheet.findById(id);

    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: 'Work time sheet not found'
      });
    }

    const entry = sheet.markAbsence(parseInt(date), absence_type, remarks);

    await sheet.save();

    res.status(200).json({
      success: true,
      data: entry,
      total_monthly: sheet.total_monthly
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking absence',
      error: error.message
    });
  }
};

// @desc    Delete work time sheet
// @route   DELETE /api/worktime/:id
// @access  Private (Admin only)
const deleteWorkTimeSheet = async (req, res) => {
  try {
    const sheet = await WorkTimeSheet.findByIdAndDelete(req.params.id);

    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: 'Work time sheet not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Work time sheet deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting work time sheet',
      error: error.message
    });
  }
};

// @desc    Export work time sheet to Excel
// @route   GET /api/worktime/:year/:month/export
// @access  Private
const exportToExcel = async (req, res) => {
  try {
    const { year, month } = req.params;

    const sheets = await WorkTimeSheet.find({
      year: parseInt(year),
      month: parseInt(month)
    }).populate('personel_id', 'user_id name').sort({ personel_name: 1 });

    if (sheets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No work time sheets found for this period'
      });
    }

    // Generate Excel data
    const excelData = generateExcelData(sheets, parseInt(year), parseInt(month));

    res.status(200).json({
      success: true,
      data: excelData,
      filename: `WorkTimeSheet_${year}_${String(month).padStart(2, '0')}.xlsx`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting to Excel',
      error: error.message
    });
  }
};

// Helper function to calculate daily summary
const calculateDailySummary = (sheets) => {
  const summary = {};

  sheets.forEach(sheet => {
    sheet.daily_entries.forEach(entry => {
      const date = entry.date;
      if (!summary[date]) {
        summary[date] = {
          date,
          day_of_week: entry.day_of_week,
          total_standard: 0,
          total_overtime: 0,
          total_time: 0,
          present_count: 0,
          absence_count: 0
        };
      }

      summary[date].total_standard += entry.standard_time || 0;
      summary[date].total_overtime += entry.overtime || 0;
      summary[date].total_time += entry.total_time || 0;
      
      if (entry.status === 'present') {
        summary[date].present_count++;
      } else if (entry.status === 'absence') {
        summary[date].absence_count++;
      }
    });
  });

  return summary;
};

// Helper function to generate Excel data
const generateExcelData = (sheets, year, month) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  
  const data = {
    headers: ['Personel'],
    rows: [],
    summary_row: { labels: ['Total/Day'] }
  };

  // Generate headers
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    data.headers.push(`${day}-${dayName}`);
  }
  data.headers.push('Total');

  // Generate rows
  sheets.forEach(sheet => {
    const row = {
      personel: sheet.personel_name,
      cells: [],
      total: sheet.total_monthly
    };

    sheet.daily_entries.forEach(entry => {
      row.cells.push({
        standard: entry.standard_time,
        overtime: entry.overtime,
        total: entry.total_time,
        status: entry.status,
        absence_type: entry.absence_type
      });
    });

    data.rows.push(row);
  });

  // Generate summary row
  const summary = calculateDailySummary(sheets);
  for (let day = 1; day <= daysInMonth; day++) {
    data.summary_row[day] = summary[day] || {
      total_standard: 0,
      total_overtime: 0,
      total_time: 0
    };
  }

  return data;
};

module.exports = {
  getWorkTimeSheet,
  getWorkTimeSheetById,
  createWorkTimeSheet,
  createBulkWorkTimeSheets,
  updateDailyEntry,
  addOvertime,
  markAbsence,
  deleteWorkTimeSheet,
  exportToExcel
};
