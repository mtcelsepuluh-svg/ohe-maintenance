// Script untuk create work time sheets December 2026
const http = require('http');

const BASE_URL = 'http://localhost:5000';

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve(jsonBody);
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function createDecemberSheets() {
  try {
    console.log('🚀 Creating Work Time Sheets for December 2026...\n');

    // Step 1: Login
    console.log('1️⃣  Logging in as ADMIN001...');
    const loginResult = await makeRequest('POST', '/api/auth/login', {
      user_id: 'ADMIN001',
      pin: 'admin123'
    });
    
    if (!loginResult.success) {
      console.error('❌ Login failed:', loginResult.message);
      return;
    }
    
    const token = loginResult.token;
    console.log('✅ Login successful\n');

    // Step 2: Create bulk work time sheets
    console.log('2️⃣  Creating work time sheets for December 2026...');
    const bulkResult = await makeRequest('POST', '/api/worktime/bulk', {
      month: 12,
      year: 2026
    }, token);
    
    if (!bulkResult.success) {
      console.error('❌ Create failed:', bulkResult.message);
      return;
    }
    
    console.log('✅ Bulk create successful');
    console.log(`   Created: ${bulkResult.results.created} sheets`);
    console.log(`   Skipped: ${bulkResult.results.skipped} sheets`);
    
    if (bulkResult.results.errors && bulkResult.results.errors.length > 0) {
      console.log(`   Errors: ${bulkResult.results.errors.length}`);
      bulkResult.results.errors.forEach(err => {
        console.log(`   - ${err.personel}: ${err.error}`);
      });
    }
    
    console.log('');

    // Step 3: Get work time sheets
    console.log('3️⃣  Fetching work time sheets...');
    const sheetsResult = await makeRequest('GET', '/api/worktime/2026/12', null, token);
    
    if (!sheetsResult.success) {
      console.error('❌ Fetch failed:', sheetsResult.message);
      return;
    }
    
    console.log(`✅ Found ${sheetsResult.count} work time sheets\n`);

    // Step 4: Display summary
    console.log('4️⃣  Summary:');
    console.log('═══════════════════════════════════════════');
    
    let grandTotal = 0;
    sheetsResult.data.forEach((sheet, index) => {
      const hours = Math.floor(sheet.total_monthly / 60);
      const mins = sheet.total_monthly % 60;
      console.log(`${index + 1}. ${sheet.personel_name.padEnd(25)} ${sheet.total_monthly} mins (${hours}h ${mins}m)`);
      grandTotal += sheet.total_monthly;
    });
    
    console.log('═══════════════════════════════════════════');
    const totalHours = Math.floor(grandTotal / 60);
    const totalMins = grandTotal % 60;
    console.log(`Total: ${grandTotal} mins (${totalHours}h ${totalMins}m)`);
    console.log('═══════════════════════════════════════════\n');

    // Step 5: Show example
    if (sheetsResult.data.length > 0) {
      console.log('5️⃣  Example (first personel):');
      const firstSheet = sheetsResult.data[0];
      console.log(`   Personel: ${firstSheet.personel_name}`);
      console.log(`   Period: December 2026`);
      console.log(`   Total: ${firstSheet.total_monthly} minutes`);
      console.log(`   Days: ${firstSheet.daily_entries.length}`);
      console.log('');
      console.log('   First 5 days:');
      firstSheet.daily_entries.slice(0, 5).forEach(entry => {
        const status = entry.status === 'absence' ? '❌' : '✅';
        const halfDay = entry.is_half_day ? ' (Half Day)' : '';
        console.log(`   ${status} Day ${entry.date} (${entry.day_of_week}): ${entry.standard_time} min${halfDay}`);
      });
      console.log('');
    }

    console.log('✅ Done!');
    console.log('');
    console.log('🌐 You can now view the work time sheets at:');
    console.log('   http://localhost:3000');
    console.log('');
    console.log('📊 Navigate to "Work Time" menu');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createDecemberSheets();
