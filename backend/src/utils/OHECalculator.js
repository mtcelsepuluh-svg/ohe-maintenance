/**
 * OHE Calculator Module
 * Module terpusat untuk perhitungan OHE (Overall Human Efficiency)
 */

/**
 * Menghitung total work time (menit)
 * @param {Object} data - Data input dengan start_time dan end_time
 * @returns {number} Total waktu dalam menit
 */
function calculateWorkTime(data) {
  try {
    const { start_time, end_time } = data;
    
    if (!start_time || !end_time) {
      return 0;
    }
    
    const start = new Date(`2000-01-01 ${start_time}`);
    const end = new Date(`2000-01-01 ${end_time}`);
    
    let diffMs = end - start;
    
    // Handle overnight shift
    if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000;
    }
    
    return Math.round(diffMs / (1000 * 60));
  } catch (error) {
    console.error('Error calculating work time:', error);
    return 0;
  }
}

/**
 * Menghitung Value Time
 * @param {Array} activities - Array aktivitas dengan category dan actual_time_min
 * @returns {number} Total Value Time dalam menit
 */
function calculateValueTime(activities) {
  try {
    return activities
      .filter(act => act.category === 'VALUE TIME')
      .reduce((sum, act) => sum + (act.actual_time_min || 0), 0);
  } catch (error) {
    console.error('Error calculating value time:', error);
    return 0;
  }
}

/**
 * Menghitung Direct Time
 * @param {Array} activities - Array aktivitas
 * @returns {number} Total Direct Time dalam menit
 */
function calculateDirectTime(activities) {
  try {
    return activities
      .filter(act => act.category === 'DIRECT')
      .reduce((sum, act) => sum + (act.actual_time_min || 0), 0);
  } catch (error) {
    console.error('Error calculating direct time:', error);
    return 0;
  }
}

/**
 * Menghitung Indirect Time
 * @param {Array} activities - Array aktivitas
 * @returns {number} Total Indirect Time dalam menit
 */
function calculateIndirectTime(activities) {
  try {
    return activities
      .filter(act => act.category === 'INDIRECT')
      .reduce((sum, act) => sum + (act.actual_time_min || 0), 0);
  } catch (error) {
    console.error('Error calculating indirect time:', error);
    return 0;
  }
}

/**
 * Menghitung Loss Time
 * @param {Array} activities - Array aktivitas
 * @returns {number} Total Loss Time dalam menit
 */
function calculateLossTime(activities) {
  try {
    return activities
      .filter(act => act.category === 'LOSS')
      .reduce((sum, act) => sum + (act.actual_time_min || 0), 0);
  } catch (error) {
    console.error('Error calculating loss time:', error);
    return 0;
  }
}

/**
 * Menghitung Direct Ratio
 * Rumus: (Direct Time / Total Work Time) * 100%
 * @param {number} directTime - Direct Time dalam menit
 * @param {number} totalWorkTime - Total Work Time dalam menit
 * @returns {number} Direct Ratio dalam persentase
 */
function calculateDirectRatio(directTime, totalWorkTime) {
  try {
    if (totalWorkTime === 0) return 0;
    return (directTime / totalWorkTime) * 100;
  } catch (error) {
    console.error('Error calculating direct ratio:', error);
    return 0;
  }
}

/**
 * Menghitung Efficiency
 * Rumus: (Value Time / Total Work Time) * 100%
 * @param {number} valueTime - Value Time dalam menit
 * @param {number} totalWorkTime - Total Work Time dalam menit
 * @returns {number} Efficiency dalam persentase
 */
function calculateEfficiency(valueTime, totalWorkTime) {
  try {
    if (totalWorkTime === 0) return 0;
    return (valueTime / totalWorkTime) * 100;
  } catch (error) {
    console.error('Error calculating efficiency:', error);
    return 0;
  }
}

/**
 * Menghitung OHE (Overall Human Efficiency)
 * Rumus: (Value Time / Total Work Time) * 100%
 * @param {Object} data - Object dengan value_time dan total_work_time
 * @returns {number} OHE dalam persentase
 */
function calculateOHE(data) {
  try {
    const { value_time, total_work_time } = data;
    
    if (!total_work_time || totalWorkTime === 0) return 0;
    
    return (value_time / total_work_time) * 100;
  } catch (error) {
    console.error('Error calculating OHE:', error);
    return 0;
  }
}

/**
 * Menghitung Achievement terhadap Target
 * Rumus: (Actual / Target) * 100%
 * @param {number} actual - Nilai aktual
 * @param {number} target - Nilai target
 * @returns {number} Achievement dalam persentase
 */
function calculateAchievement(actual, target) {
  try {
    if (!target || target === 0) return 0;
    return (actual / target) * 100;
  } catch (error) {
    console.error('Error calculating achievement:', error);
    return 0;
  }
}

/**
 * Menentukan Status berdasarkan nilai dan benchmark
 * @param {number} value - Nilai aktual (OHE)
 * @param {number} target - Target OHE
 * @param {number} benchmark - Benchmark OHE
 * @returns {string} Status: 'ACHIEVED', 'WARNING', atau 'NOT ACHIEVED'
 */
function calculateStatus(value, target, benchmark) {
  try {
    if (value >= benchmark) {
      return 'ACHIEVED';
    } else if (value >= target) {
      return 'WARNING';
    } else {
      return 'NOT ACHIEVED';
    }
  } catch (error) {
    console.error('Error calculating status:', error);
    return 'NOT ACHIEVED';
  }
}

/**
 * Menghitung ringkasan OHE dari array activities
 * @param {Array} activities - Array aktivitas harian
 * @param {Object} settings - Pengaturan working hours
 * @returns {Object} Ringkasan OHE
 */
function calculateOHESummary(activities, settings = {}) {
  try {
    const totalWorkTime = activities.reduce((sum, act) => sum + (act.actual_time_min || 0), 0);
    const valueTime = calculateValueTime(activities);
    const directTime = calculateDirectTime(activities);
    const indirectTime = calculateIndirectTime(activities);
    const lossTime = calculateLossTime(activities);
    
    const efficiency = calculateEfficiency(valueTime, totalWorkTime);
    const directRatio = calculateDirectRatio(directTime, totalWorkTime);
    const ohe = calculateOHE({ value_time: valueTime, total_work_time: totalWorkTime });
    
    return {
      total_work_time: totalWorkTime,
      value_time: valueTime,
      direct_time: directTime,
      indirect_time: indirectTime,
      loss_time: lossTime,
      efficiency: Math.round(efficiency * 100) / 100,
      direct_ratio: Math.round(directRatio * 100) / 100,
      ohe: Math.round(ohe * 100) / 100
    };
  } catch (error) {
    console.error('Error calculating OHE summary:', error);
    return {
      total_work_time: 0,
      value_time: 0,
      direct_time: 0,
      indirect_time: 0,
      loss_time: 0,
      efficiency: 0,
      direct_ratio: 0,
      ohe: 0
    };
  }
}

module.exports = {
  calculateWorkTime,
  calculateValueTime,
  calculateDirectTime,
  calculateIndirectTime,
  calculateLossTime,
  calculateDirectRatio,
  calculateEfficiency,
  calculateOHE,
  calculateAchievement,
  calculateStatus,
  calculateOHESummary
};
