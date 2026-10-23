/**
 * Indirect Time Activities Data
 * Data aktivitas Indirect Time untuk OHE MTC
 */

const indirectTimeActivities = [
  {
    activity_code: 'IND-001',
    activity_name: 'Briefing MTC',
    category: 'INDIRECT',
    standard_time: 15,
    unit: 'minutes',
    description: 'Briefing pagi untuk tim MTC',
    status: 'active'
  },
  {
    activity_code: 'IND-002',
    activity_name: 'Briefing All divisi',
    category: 'INDIRECT',
    standard_time: 30,
    unit: 'minutes',
    description: 'Briefing bersama seluruh divisi',
    status: 'active'
  },
  {
    activity_code: 'IND-003',
    activity_name: 'Work Preparation / Persiapan Alat',
    category: 'INDIRECT',
    standard_time: 20,
    unit: 'minutes',
    description: 'Persiapan alat dan material sebelum kerja',
    status: 'active'
  },
  {
    activity_code: 'IND-004',
    activity_name: 'Work Completion / Pembuatan laporan',
    category: 'INDIRECT',
    standard_time: 15,
    unit: 'minutes',
    description: 'Pembuatan laporan pekerjaan dan dokumentasi',
    status: 'active'
  },
  {
    activity_code: 'IND-005',
    activity_name: 'Fisiotheraphy',
    category: 'INDIRECT',
    standard_time: 10,
    unit: 'minutes',
    description: 'Istirahat dan pemulihan fisik',
    status: 'active'
  },
  {
    activity_code: 'IND-006',
    activity_name: '5R',
    category: 'INDIRECT',
    standard_time: 15,
    unit: 'minutes',
    description: 'Ringkas, Rapi, Resik, Rawat, Rajin (5S/5R)',
    status: 'active'
  },
  {
    activity_code: 'IND-007',
    activity_name: 'Meeting / Training',
    category: 'INDIRECT',
    standard_time: 60,
    unit: 'minutes',
    description: 'Meeting atau training kerja',
    status: 'active'
  },
  {
    activity_code: 'IND-008',
    activity_name: 'Toilet',
    category: 'INDIRECT',
    standard_time: 10,
    unit: 'minutes',
    description: 'Istirahat ke toilet',
    status: 'active'
  }
];

module.exports = indirectTimeActivities;
