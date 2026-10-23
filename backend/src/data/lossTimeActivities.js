/**
 * Loss Time Activities Data
 * Data aktivitas Loss Time untuk OHE MTC
 */

const lossTimeActivities = [
  {
    activity_code: 'LOSS-001',
    activity_name: 'Menunggu spare part',
    category: 'LOSS',
    standard_time: 0,
    unit: 'minutes',
    description: 'Waktu tunggu karena spare part tidak tersedia',
    status: 'active'
  },
  {
    activity_code: 'LOSS-002',
    activity_name: 'Menunggu mesin tanpa ada kegiatan lain',
    category: 'LOSS',
    standard_time: 0,
    unit: 'minutes',
    description: 'Idle time karena mesin dalam proses perbaikan',
    status: 'active'
  },
  {
    activity_code: 'LOSS-003',
    activity_name: 'Response perbaikan lebih dari 15 menit',
    category: 'LOSS',
    standard_time: 0,
    unit: 'minutes',
    description: 'Delay response time untuk perbaikan',
    status: 'active'
  },
  {
    activity_code: 'LOSS-004',
    activity_name: 'Menunggu QC',
    category: 'LOSS',
    standard_time: 0,
    unit: 'minutes',
    description: 'Waktu tunggu untuk quality check',
    status: 'active'
  }
];

module.exports = lossTimeActivities;
