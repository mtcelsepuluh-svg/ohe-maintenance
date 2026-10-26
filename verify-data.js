// Script untuk verifikasi data work time Oktober 2026
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let authToken = '';

async function verifyData() {
  try {
    // Login
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      user_id: 'ADMIN001',
      pin: 'admin123'
    });
    authToken = loginRes.data.token;
    console.log('✓ Login berhasil\n');

    // Get work time sheets untuk Oktober 2026
    console.log('=== Verifikasi Data Oktober 2026 ===\n');
    const sheetsRes = await axios.get(`${BASE_URL}/api/worktime/2026/10`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const sheets = sheetsRes.data.data;
    console.log(`Total sheets: ${sheets.length}\n`);

    // Cari Ade Usman
    const adeSheet = sheets.find(s => s.personel_name === 'Ade Usman');
    if (adeSheet) {
      console.log('✓ Ade Usman sheet ditemukan');
      console.log(`  Sheet ID: ${adeSheet._id}\n`);

      // Cek tanggal 4 (yang di-edit dengan overtime 60)
      const day4 = adeSheet.daily_entries.find(e => e.date === 4);
      if (day4) {
        console.log('Data tanggal 4:');
        console.log(`  - Effective minutes: ${day4.effective_minutes || day4.standard_time}`);
        console.log(`  - Overtime: ${day4.overtime}`);
        console.log(`  - Total time: ${day4.total_time}`);
        console.log(`  - Absence type: ${day4.absence_type}`);
        console.log(`  - Leave hours: ${day4.leave_hours}`);
        console.log(`  - Status: ${day4.status}\n`);

        if (day4.overtime === 60) {
          console.log('✓ OVERTIME 60 MENIT TERSIMPAN DENGAN BENAR!');
        } else {
          console.log('✗ Overtime tidak sesuai yang diharapkan (60 menit)');
        }
      } else {
        console.log('✗ Tanggal 4 tidak ditemukan');
      }
    } else {
      console.log('✗ Ade Usman sheet tidak ditemukan');
    }

    // Tampilkan summary semua mekanik untuk tanggal 4
    console.log('\n=== Summary Tanggal 4 (Oktober 2026) ===\n');
    console.log('Mekanik | Overtime | Absence Type | Total Time');
    console.log('-'.repeat(60));
    
    sheets.forEach(sheet => {
      const day4 = sheet.daily_entries.find(e => e.date === 4);
      if (day4) {
        const overtime = day4.overtime || 0;
        const absenceType = day4.absence_type || '-';
        const totalTime = day4.total_time || 0;
        console.log(`${sheet.personel_name.padEnd(20)} | ${String(overtime).padEnd(8)} | ${absenceType.padEnd(14)} | ${totalTime}`);
      }
    });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

verifyData();
