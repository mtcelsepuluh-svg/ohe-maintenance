// Test script untuk Work Time API
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testWorkTimeAPI() {
  try {
    console.log('🧪 Testing Work Time API...\n');

    // Step 1: Login
    console.log('1️⃣  Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      user_id: 'ADMIN001',
      pin: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Get all users
    console.log('2️⃣  Get all users...');
    const usersResponse = await axios.get(`${BASE_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const users = usersResponse.data.data;
    console.log(`Found ${users.length} users`);
    
    // Filter MEKANIK users
    const mekaniks = users.filter(u => u.role === 'MEKANIK' && u.status === 'active');
    console.log(`Found ${mekaniks.length} active mekaniks\n`);

    // Step 3: Check existing work time sheets for December 2026
    console.log('3️⃣  Check existing work time sheets...');
    const sheetsResponse = await axios.get(`${BASE_URL}/worktime/2026/12`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`Found ${sheetsResponse.data.count} existing sheets\n`);

    // Step 4: Create bulk work time sheets if none exist
    if (sheetsResponse.data.count === 0) {
      console.log('4️⃣  Create bulk work time sheets for December 2026...');
      const bulkResponse = await axios.post(
        `${BASE_URL}/worktime/bulk`,
        { month: 12, year: 2026 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log(`✅ Created ${bulkResponse.data.results.created} sheets`);
      console.log(`⏭️  Skipped ${bulkResponse.data.results.skipped} sheets\n`);
    }

    // Step 5: Get work time sheets again
    console.log('5️⃣  Get work time sheets...');
    const finalSheetsResponse = await axios.get(`${BASE_URL}/worktime/2026/12`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Found ${finalSheetsResponse.data.count} sheets`);
    
    // Show first sheet as example
    if (finalSheetsResponse.data.data.length > 0) {
      const firstSheet = finalSheetsResponse.data.data[0];
      console.log(`\n📋 Example sheet:`);
      console.log(`   Personel: ${firstSheet.personel_name}`);
      console.log(`   Month: ${firstSheet.month}/${firstSheet.year}`);
      console.log(`   Total Monthly: ${firstSheet.total_monthly} minutes (${Math.floor(firstSheet.total_monthly / 60)} hours)`);
      console.log(`   Daily Entries: ${firstSheet.daily_entries.length} days`);
      
      // Show first 3 days
      console.log(`\n   First 3 days:`);
      firstSheet.daily_entries.slice(0, 3).forEach(entry => {
        console.log(`   - Day ${entry.date} (${entry.day_of_week}): ${entry.standard_time} min standard, ${entry.overtime} min overtime`);
      });
    }

    // Step 6: Test add overtime
    console.log('\n6️⃣  Test add overtime...');
    if (finalSheetsResponse.data.data.length > 0) {
      const sheetId = finalSheetsResponse.data.data[0]._id;
      const overtimeResponse = await axios.post(
        `${BASE_URL}/worktime/${sheetId}/overtime`,
        {
          date: 2,
          overtime_minutes: 180,
          is_manual: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log(`✅ Added 180 minutes overtime to day 2`);
      console.log(`   New total time: ${overtimeResponse.data.data.total_time} minutes`);
    }

    // Step 7: Test mark absence
    console.log('\n7️⃣  Test mark absence...');
    if (finalSheetsResponse.data.data.length > 0) {
      const sheetId = finalSheetsResponse.data.data[0]._id;
      const absenceResponse = await axios.post(
        `${BASE_URL}/worktime/${sheetId}/absence`,
        {
          date: 7,
          absence_type: 'sakit',
          remarks: 'Test absence'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log(`✅ Marked day 7 as absence (sakit)`);
      console.log(`   Status: ${absenceResponse.data.data.status}`);
      console.log(`   Total time: ${absenceResponse.data.data.total_time} minutes`);
    }

    console.log('\n✅ All tests passed!');
    console.log('\n🌐 You can now access the application at: http://localhost:3000');
    console.log('📊 Navigate to "Work Time" menu to see the work time sheets');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testWorkTimeAPI();
