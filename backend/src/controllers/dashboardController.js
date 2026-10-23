const OHEInput = require('../models/OHEInput');
const Mekanik = require('../models/Mekanik');
const OHECalculator = require('../utils/OHECalculator');

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const { startDate, endDate, nama, shift } = req.query;

    let query = {};

    // Default to current month if no dates provided
    if (!startDate || !endDate) {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      query.date = { $gte: firstDay, $lte: now };
    } else {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (nama) query.nama = nama;
    if (shift) query.shift = shift;

    // If user is MEKANIK, only show their data
    if (req.user.role === 'MEKANIK') {
      query.nama = req.user.name;
    }

    const oheInputs = await OHEInput.find(query);

    // Calculate summary
    const totalWorkTime = oheInputs.reduce((sum, input) => sum + (input.actual_time_min || 0), 0);
    const totalIndirectTime = oheInputs.reduce((sum, input) => sum + (input.durasi_indirect_min || 0), 0);
    const totalLossTime = oheInputs.reduce((sum, input) => sum + (input.durasi_loss_time_min || 0), 0);
    const valueTime = totalWorkTime - totalIndirectTime - totalLossTime;
    const ohe = totalWorkTime > 0 ? (valueTime / totalWorkTime) * 100 : 0;

    // Get all machines
    const machines = await Mekanik.find({ status: 'active' });

    // Calculate per machine
    const machinePerformance = [];
    for (const machine of machines) {
      const machineInputs = oheInputs.filter(input => input.nama === machine.nama_mekanik);
      const machineTotalWorkTime = machineInputs.reduce((sum, input) => sum + (input.actual_time_min || 0), 0);
      const machineIndirectTime = machineInputs.reduce((sum, input) => sum + (input.durasi_indirect_min || 0), 0);
      const machineLossTime = machineInputs.reduce((sum, input) => sum + (input.durasi_loss_time_min || 0), 0);
      const machineValueTime = machineTotalWorkTime - machineIndirectTime - machineLossTime;
      const machineOHE = machineTotalWorkTime > 0 ? (machineValueTime / machineTotalWorkTime) * 100 : 0;

      const achievement = machineOHE > 0 ? (machineOHE / machine.target_ohe) * 100 : 0;
      
      let status = 'NOT ACHIEVED';
      if (machineOHE >= machine.benchmark_ohe) status = 'ACHIEVED';
      else if (machineOHE >= machine.target_ohe) status = 'WARNING';

      machinePerformance.push({
        machine_name: machine.machine_name,
        machine_code: machine.machine_code,
        mekanik: machine.nama_mekanik,
        ohe: Math.round(machineOHE * 100) / 100,
        target: machine.target_ohe,
        benchmark: machine.benchmark_ohe,
        achievement: Math.round(achievement * 100) / 100,
        efficiency: Math.round(machineOHE * 100) / 100,
        total_work_time: machineTotalWorkTime,
        value_time: machineValueTime,
        direct_time: machineValueTime,
        indirect_time: machineIndirectTime,
        loss_time: machineLossTime,
        status
      });
    }

    // Calculate overall achievement
    const defaultTarget = 85;
    const defaultBenchmark = 90;
    const overallAchievement = ohe > 0 ? (ohe / defaultTarget) * 100 : 0;
    
    let overallStatus = 'NOT ACHIEVED';
    if (ohe >= defaultBenchmark) overallStatus = 'ACHIEVED';
    else if (ohe >= defaultTarget) overallStatus = 'WARNING';

    res.json({
      success: true,
      data: {
        summary: {
          total_work_time: totalWorkTime,
          value_time: valueTime,
          indirect_time: totalIndirectTime,
          loss_time: totalLossTime,
          ohe: Math.round(ohe * 100) / 100,
          efficiency: Math.round(ohe * 100) / 100,
          target_ohe: defaultTarget,
          benchmark_ohe: defaultBenchmark,
          achievement: Math.round(overallAchievement * 100) / 100,
          status: overallStatus
        },
        machine_performance: machinePerformance,
        period: {
          start: query.date.$gte,
          end: query.date.$lte
        },
        total_records: oheInputs.length
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // If user is MEKANIK, only show their data
    if (req.user.role === 'MEKANIK') {
      query.nama = req.user.name;
    }

    const oheInputs = await OHEInput.find(query);

    // Group by kategori_pekerjaan
    const byCategory = {
      'Corective': 0,
      'Preventive': 0,
      'Proyek': 0
    };

    oheInputs.forEach(input => {
      if (byCategory[input.kategori_pekerjaan] !== undefined) {
        byCategory[input.kategori_pekerjaan] += input.actual_time_min;
      }
    });

    // Group by date
    const byDate = {};
    oheInputs.forEach(input => {
      const dateKey = input.date.toISOString().split('T')[0];
      if (!byDate[dateKey]) {
        byDate[dateKey] = {
          date: dateKey,
          corective_time: 0,
          preventive_time: 0,
          proyek_time: 0,
          indirect_time: 0,
          loss_time: 0,
          total_time: 0
        };
      }

      byDate[dateKey].total_time += input.actual_time_min;
      byDate[dateKey].indirect_time += (input.durasi_indirect_min || 0);
      byDate[dateKey].loss_time += (input.durasi_loss_time_min || 0);

      switch(input.kategori_pekerjaan) {
        case 'Corective':
          byDate[dateKey].corective_time += input.actual_time_min;
          break;
        case 'Preventive':
          byDate[dateKey].preventive_time += input.actual_time_min;
          break;
        case 'Proyek':
          byDate[dateKey].proyek_time += input.actual_time_min;
          break;
      }
    });

    // Calculate OHE per date
    const trendData = Object.values(byDate).map(day => {
      const totalWorkTime = day.total_time;
      const indirectAndLoss = day.indirect_time + day.loss_time;
      const valueTime = totalWorkTime - indirectAndLoss;
      const ohe = totalWorkTime > 0 ? (valueTime / totalWorkTime) * 100 : 0;
      const efficiency = ohe;

      return {
        date: day.date,
        ohe: Math.round(ohe * 100) / 100,
        efficiency: Math.round(efficiency * 100) / 100,
        corective_time: day.corective_time,
        preventive_time: day.preventive_time,
        proyek_time: day.proyek_time,
        indirect_time: day.indirect_time,
        loss_time: day.loss_time,
        total_time: day.total_time
      };
    });

    res.json({
      success: true,
      data: {
        by_category: byCategory,
        trend: trendData.sort((a, b) => new Date(a.date) - new Date(b.date)),
        total_records: oheInputs.length
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get OHE analysis
// @route   GET /api/dashboard/analysis
// @access  Private
const getOHEAnalysis = async (req, res) => {
  try {
    const { startDate, endDate, nama } = req.query;

    let query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (nama) query.nama = nama;

    // If user is MEKANIK, only show their data
    if (req.user.role === 'MEKANIK') {
      query.nama = req.user.name;
    }

    const oheInputs = await OHEInput.find(query);

    // Group by nama (mekanik)
    const byMekanik = {};
    oheInputs.forEach(input => {
      if (!byMekanik[input.nama]) {
        byMekanik[input.nama] = [];
      }
      byMekanik[input.nama].push(input);
    });

    // Calculate per mekanik
    const mekanikAnalysis = Object.keys(byMekanik).map(mekanikName => {
      const inputs = byMekanik[mekanikName];
      
      // Calculate totals
      const totalWorkTime = inputs.reduce((sum, input) => sum + (input.actual_time_min || 0), 0);
      const totalIndirectTime = inputs.reduce((sum, input) => sum + (input.durasi_indirect_min || 0), 0);
      const totalLossTime = inputs.reduce((sum, input) => sum + (input.durasi_loss_time_min || 0), 0);
      
      // Value time = actual_time - indirect_time - loss_time
      const valueTime = totalWorkTime - totalIndirectTime - totalLossTime;
      
      // Calculate OHE: (Value Time / Total Work Time) * 100
      const ohe = totalWorkTime > 0 ? (valueTime / totalWorkTime) * 100 : 0;
      const efficiency = ohe;
      
      // Determine status
      let status = 'NOT ACHIEVED';
      if (ohe >= 90) status = 'ACHIEVED';
      else if (ohe >= 85) status = 'WARNING';
      
      return {
        mekanik: mekanikName,
        total_work_time: totalWorkTime,
        value_time: valueTime,
        indirect_time: totalIndirectTime,
        loss_time: totalLossTime,
        ohe: Math.round(ohe * 100) / 100,
        efficiency: Math.round(efficiency * 100) / 100,
        total_activities: inputs.length,
        status
      };
    });

    // Sort by OHE descending
    mekanikAnalysis.sort((a, b) => b.ohe - a.ohe);

    // Group by kategori_pekerjaan
    const byActivity = {};
    oheInputs.forEach(input => {
      const key = `${input.kategori_pekerjaan}_${input.jenis_pekerjaan}`;
      if (!byActivity[key]) {
        byActivity[key] = {
          activity_code: input.kategori_pekerjaan,
          activity_name: input.jenis_pekerjaan,
          category: input.kategori_pekerjaan,
          total_time: 0,
          frequency: 0
        };
      }
      byActivity[key].total_time += input.actual_time_min;
      byActivity[key].frequency += 1;
    });

    const activityAnalysis = Object.values(byActivity).sort((a, b) => b.total_time - a.total_time);

    res.json({
      success: true,
      data: {
        mekanik_analysis: mekanikAnalysis,
        activity_analysis: activityAnalysis,
        total_records: oheInputs.length
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getDashboard,
  getDashboardStats,
  getOHEAnalysis
};
