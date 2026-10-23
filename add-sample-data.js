// Script untuk menambahkan sample overtime dan absence
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

async function addSampleData() {
  try {
    console.log('📝 Adding Sample Overtime and Absence Data...\n');

    // Step 1: Login
    console.log('1️⃣  Logging in...');
    const loginResult = await makeRequest('POST', '/api/auth/login', {
      user_id: 'ADMIN001',
      pin: 'admin123'
    });
    
    const token = loginResult.token;
    console.log('✅ Login successful\n');

    // Step 2: Get work time sheets
    console.log('2️⃣  Fetching work time sheets...');
    const sheetsResult = await makeRequest('GET', '/api/worktime/2026/12', null, token);
    
    if (!sheetsResult.success || sheetsResult.count === 0) {
      console.error('❌ No work time sheets found');
      return;
    }
    
    console.log(`✅ Found ${sheetsResult.count} sheets\n`);

    // Step 3: Add overtime to Supriyanto (first sheet)
    console.log('3️⃣  Adding overtime to Supriyanto...');
    const supriyantoSheet = sheetsResult.data.find(s => s.personel_name === 'Supriyanto');
    
    if (supriyantoSheet) {
      // Add overtime on day 2
      await makeRequest('POST', `/api/worktime/${supriyantoSheet._id}/overtime`, {
        date: 2,
        overtime_minutes: 180,
        is_manual: true
      }, token);
      console.log('   ✅ Day 2: +180 min overtime');
      
      // Add overtime on day 5
      await makeRequest('POST', `/api/worktime/${supriyantoSheet._id}/overtime`, {
        date: 5,
        overtime_minutes: 120,
        is_manual: true
      }, token);
      console.log('   ✅ Day 5: +120 min overtime');
    }

    // Step 4: Mark absence for Sudarto (second sheet)
    console.log('\n4️⃣  Marking absence for Sudarto...');
    const sudartoSheet = sheetsResult.data.find(s => s.personel_name === 'Sudarto');
    
    if (sudartoSheet) {
      // Mark day 7 as sakit
      await makeRequest('POST', `/api/worktime/${sudartoSheet._id}/absence`, {
        date: 7,
        absence_type: 'sakit',
        remarks: 'Demam tinggi'
      }, token);
      console.log('   ✅ Day 7: Sakit (Demam tinggi)');
      
      // Mark day 14 as ijin
      await makeRequest('POST', `/api/worktime/${sudartoSheet._id}/absence`, {
        date: 14,
        absence_type: 'ijin',
        remarks: 'Urusan keluarga'
      }, token);
      console.log('   ✅ Day 14: Ijin (Urusan keluarga)');
    }

    // Step 5: Add overtime to Adi Wibowo
    console.log('\n5️⃣  Adding overtime to Adi Wibowo...');
    const adiSheet = sheetsResult.data.find(s => s.personel_name === 'Adi Wibowo');
    
    if (adiSheet) {
      // Add overtime on day 3
      await makeRequest('POST', `/api/worktime/${adiSheet._id}/overtime`, {
        date: 3,
        overtime_minutes: 150,
        is_manual: true
      }, token);
      console.log('   ✅ Day 3: +150 min overtime');
    }

    // Step 6: Get updated sheets
    console.log('\n6️⃣  Fetching updated sheets...');
    const updatedSheetsResult = await makeRequest('GET', '/api/worktime/2026/12', null, token);
    
    console.log('\n📊 Updated Summary:');
    console.log('═══════════════════════════════════════════');
    
    let grandTotal = 0;
    updatedSheetsResult.data.forEach((sheet, index) => {
      const hours = Math.floor(sheet.total_monthly / 60);
      const mins = sheet.total_monthly % 60;
      const overtimeCount = sheet.daily_entries.filter(e => e.overtime > 0).length;
      const absenceCount = sheet.daily_entries.filter(e => e.status === 'absence').length;
      
      let info = `${index + 1}. ${sheet.personel_name.padEnd(20)} ${sheet.total_monthly} mins (${hours}h ${mins}m)`;
      if (overtimeCount > 0) info += ` | OT: ${overtimeCount} days`;
      if (absenceCount > 0) info += ` | Abs: ${absenceCount} days`;
      
      console.log(info);
      grandTotal += sheet.total_monthly;
    });
    
    console.log('═══════════════════════════════════════════');
    const totalHours = Math.floor(grandTotal / 60);
    const totalMins = grandTotal % 60;
    console.log(`Total: ${grandTotal} mins (${totalHours}h ${totalMins}m)`);
    console.log('═══════════════════════════════════════════\n');

    console.log('✅ Done!');
    console.log('');
    console.log('🌐 You can now view the updated data at:');
    console.log('   http://localhost:3000');
    console.log('');
    console.log('📊 Navigate to "Work Time" menu');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addSampleData();
