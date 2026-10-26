// Script untuk mendiagnosis masalah matching
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let authToken = '';

async function diagnose() {
  try {
    // Login
    console.log('1. Login...');
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      user_id: 'ADMIN001',
      pin: 'admin123'
    });
    authToken = loginRes.data.token;

    // Get mekaniks
    console.log('\n2. Mekaniks:');
    const mekanikRes = await axios.get(`${BASE_URL}/api/mekaniks`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const mekaniks = mekanikRes.data.data;
    mekaniks.forEach(m => {
      console.log(`   - ${m.nama_mekanik} (ID: ${m._id}, machine_code: ${m.machine_code})`);
    });

    // Get work time sheets
    console.log('\n3. Work Time Sheets (10/2026):');
    const sheetsRes = await axios.get(`${BASE_URL}/api/worktime/2026/10`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const sheets = sheetsRes.data.data;
    sheets.forEach(s => {
      const personelId = s.personel_id?._id || s.personel_id;
      console.log(`   - ${s.personel_name} (Sheet ID: ${s._id}, Personel ID: ${personelId})`);
    });

    // Check matching
    console.log('\n4. Matching Analysis:');
    mekaniks.forEach(m => {
      const matchingSheet = sheets.find(s => s.personel_name === m.nama_mekanik);
      if (matchingSheet) {
        console.log(`   ✓ ${m.nama_mekanik} → MATCH (Sheet: ${matchingSheet._id})`);
      } else {
        console.log(`    ${m.nama_mekanik} → NO MATCH`);
      }
    });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

diagnose();
