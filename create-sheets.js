// Script untuk create work time sheets untuk semua mekanik
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let authToken = '';

async function createSheets() {
  try {
    // Login
    console.log('1. Login...');
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      user_id: 'ADMIN001',
      pin: 'admin123'
    });
    authToken = loginRes.data.token;
    console.log('✓ Login berhasil\n');

    // Get all mekaniks
    console.log('2. Get all mekaniks...');
    const mekanikRes = await axios.get(`${BASE_URL}/api/mekaniks`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const mekaniks = mekanikRes.data.data;
    console.log(`✓ Ditemukan ${mekaniks.length} mekanik\n`);

    // Get existing work time sheets
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    console.log(`3. Get existing work time sheets for ${month}/${year}...`);
    const sheetsRes = await axios.get(`${BASE_URL}/api/worktime/${year}/${month}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const existingSheets = sheetsRes.data.data;
    console.log(`✓ Ditemukan ${existingSheets.length} existing sheets\n`);

    // Get existing personel IDs
    const existingPersonelIds = existingSheets.map(s => s.personel_id?._id || s.personel_id);
    console.log('Existing personel IDs:', existingPersonelIds);

    // Find mekaniks without sheets
    const mekaniksWithoutSheets = mekaniks.filter(m => !existingPersonelIds.includes(m._id));
    console.log(`\n✓ Mekanik tanpa sheet: ${mekaniksWithoutSheets.length}\n`);

    if (mekaniksWithoutSheets.length === 0) {
      console.log('Semua mekanik sudah punya work time sheet!');
      return;
    }

    // Create sheets for mekaniks without sheets
    console.log('4. Creating work time sheets...');
    for (const mekanik of mekaniksWithoutSheets) {
      try {
        console.log(`   - Creating sheet for: ${mekanik.nama_mekanik}`);
        
        // Get user by machine_code (user_id)
        const userRes = await axios.get(`${BASE_URL}/api/users?user_id=${mekanik.machine_code}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (userRes.data.data && userRes.data.data.length > 0) {
          const user = userRes.data.data[0];
          
          // Create work time sheet
          await axios.post(`${BASE_URL}/api/worktime`, {
            personel_id: user._id,
            month: month,
            year: year
          }, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`     ✓ Created for ${mekanik.nama_mekanik} (User: ${user.name})`);
        } else {
          console.log(`     ⚠ User not found for machine_code: ${mekanik.machine_code}`);
        }
      } catch (error) {
        console.log(`      Error: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n=== Selesai ===');
    console.log(`✓ Created ${mekaniksWithoutSheets.length} work time sheets`);

  } catch (error) {
    console.error('\n✗ Error:', error.response?.data || error.message);
  }
}

createSheets();
