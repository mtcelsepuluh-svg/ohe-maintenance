const XLSX = require('xlsx');

// Test data dengan format baru (hanya durasi, tanpa jam mulai/selesai)
const testData = [
  {
    'Nama': 'ADMIN001',
    'Jenis Pekerjaan': 'Servicing Motor OHE',
    'Tanggal': '2026-01-15',
    'Durasi ( dlm menit )': 45,
    'Kategori Pekerjaan': 'Preventive',
    'Loss Time': '',
    'Durasi waktu Loss Time': 0
  },
  {
    'Nama': 'ADMIN001',
    'Jenis Pekerjaan': 'Perbaikan Pantograph',
    'Tanggal': '2026-01-16',
    'Durasi ( dlm menit )': 120,
    'Kategori Pekerjaan': 'Corective',
    'Loss Time': 'Waiting material',
    'Durasi waktu Loss Time': 30
  },
  {
    'Nama': 'ADMIN001',
    'Jenis Pekerjaan': 'Installasi Equipment Baru',
    'Tanggal': '2026-01-17',
    'Durasi ( dlm menit )': 180,
    'Kategori Pekerjaan': 'Proyek',
    'Loss Time': '',
    'Durasi waktu Loss Time': 0
  },
  {
    'Nama': 'ADMIN001',
    'Jenis Pekerjaan': 'Meeting Planning',
    'Tanggal': '2026-01-18',
    'Durasi ( dlm menit )': 60,
    'Kategori Pekerjaan': 'Indirect',
    'Loss Time': '',
    'Durasi waktu Loss Time': 0
  },
  {
    'Nama': 'ADMIN001',
    'Jenis Pekerjaan': 'Inspeksi Rutin',
    'Tanggal': '2026-01-19',
    'Durasi ( dlm menit )': 90,
    'Kategori Pekerjaan': 'Preventive',
    'Loss Time': '',
    'Durasi waktu Loss Time': 0
  }
];

// Create workbook and worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(testData);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Activities');

// Write to file
XLSX.writeFile(wb, 'test-import-new-format.xlsx');

console.log('✅ Test Excel file created: test-import-new-format.xlsx');
console.log('');
console.log('Test Data:');
console.log('- 5 records dengan format baru');
console.log('- Kolom: Nama, Jenis Pekerjaan, Tanggal, Durasi ( dlm menit )');
console.log('- Tanpa kolom Jam Mulai dan Jam Selesai');
console.log('- Berbagai kategori: Preventive, Corective, Proyek, Indirect');
