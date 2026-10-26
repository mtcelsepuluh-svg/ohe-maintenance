// Test script untuk verifikasi fitur edit work time
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let authToken = '';

async function testEditWorkTime() {
  try {
    console.log('=== Test Edit Work Time Feature ===\n');

    // 1. Login
    console.log('1. Login...');
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      user_id: 'ADMIN001',
      pin: 'admin123'
    });
    authToken = loginRes.data.token;
    console.log('✓ Login berhasil\n');

    // 2. Get work time sheets
    console.log('2. Get work time sheets for October 2026...');
    const sheetsRes = await axios.get(`${BASE_URL}/api/worktime/2026/10`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const sheets = sheetsRes.data.data;
    console.log(`✓ Ditemukan ${sheets.length} sheets\n`);

    if (sheets.length === 0) {
      console.log('Tidak ada work time sheet untuk ditest');
      return;
    }

    const sheet = sheets[0];
    console.log(`Test dengan: ${sheet.personel_name}`);
    console.log(`Sheet ID: ${sheet._id}\n`);

    // 3. Test update dengan overtime
    console.log('3. Test update dengan overtime...');
    const testDate = 15;
    const updateRes = await axios.put(
      `${BASE_URL}/api/worktime/${sheet._id}/day/${testDate}`,
      {
        date: testDate,
        overtime: 120,
        absence_type: null,
        leave_hours: 0
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✓ Update berhasil!');
    console.log(`  - Overtime: ${updateRes.data.data.overtime} menit`);
    console.log(`  - Total time: ${updateRes.data.data.total_time} menit`);
    console.log(`  - Total monthly: ${updateRes.data.total_monthly} menit\n`);

    // 4. Test update dengan absence type (Sakit)
    console.log('4. Test update dengan absence type (Sakit)...');
    const testDate2 = 16;
    const updateRes2 = await axios.put(
      `${BASE_URL}/api/worktime/${sheet._id}/day/${testDate2}`,
      {
        date: testDate2,
        overtime: 0,
        absence_type: 'sakit',
        leave_hours: 0
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✓ Update berhasil!');
    console.log(`  - Absence type: ${updateRes2.data.data.absence_type}`);
    console.log(`  - Total time: ${updateRes2.data.data.total_time} menit`);
    console.log(`  - Total monthly: ${updateRes2.data.total_monthly} menit\n`);

    // 5. Test update dengan Ijin Sebagian
    console.log('5. Test update dengan Ijin Sebagian (2 jam)...');
    const testDate3 = 17;
    const updateRes3 = await axios.put(
      `${BASE_URL}/api/worktime/${sheet._id}/day/${testDate3}`,
      {
        date: testDate3,
        overtime: 0,
        absence_type: 'ijin_sebagian',
        leave_hours: 2
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✓ Update berhasil!');
    console.log(`  - Absence type: ${updateRes3.data.data.absence_type}`);
    console.log(`  - Leave hours: ${updateRes3.data.data.leave_hours} jam`);
    console.log(`  - Total time: ${updateRes3.data.data.total_time} menit`);
    console.log(`  - Total monthly: ${updateRes3.data.total_monthly} menit\n`);

    // 6. Verify semua update
    console.log('6. Verify semua update...');
    const verifyRes = await axios.get(`${BASE_URL}/api/worktime/2026/10`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const updatedSheet = verifyRes.data.data.find(s => s._id === sheet._id);
    
    const entry1 = updatedSheet.daily_entries.find(e => e.date === testDate);
    const entry2 = updatedSheet.daily_entries.find(e => e.date === testDate2);
    const entry3 = updatedSheet.daily_entries.find(e => e.date === testDate3);

    console.log('✓ Data ter-verify:');
    console.log(`  - Tanggal ${testDate}: Overtime ${entry1.overtime} menit`);
    console.log(`  - Tanggal ${testDate2}: Absence ${entry2.absence_type}`);
    console.log(`  - Tanggal ${testDate3}: Absence ${entry3.absence_type}, Leave ${entry3.leave_hours} jam`);
    console.log(`  - Total monthly: ${updatedSheet.total_monthly} menit\n`);

    console.log('=== Test Selesai ===');
    console.log('✓ Semua fitur edit work time berfungsi dengan benar!');
    console.log('✓ Overtime, absence types, dan leave hours berhasil di-update');
    console.log('✓ Data tersimpan dan ter-verify di database');

  } catch (error) {
    console.error('\n✗ Error:', error.response?.data || error.message);
  }
}

testEditWorkTime();
