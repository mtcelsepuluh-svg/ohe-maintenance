// Script untuk create test users (mekaniks)
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

async function createTestUsers() {
  try {
    console.log('👥 Creating Test Users (Mekaniks)...\n');

    // Step 1: Login as admin
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

    // Step 2: Check existing users
    console.log('2️⃣  Checking existing users...');
    const usersResult = await makeRequest('GET', '/api/auth/users', null, token);
    
    console.log('Response:', JSON.stringify(usersResult, null, 2));
    
    if (!usersResult.success) {
      console.error('❌ Fetch users failed:', usersResult.message);
      return;
    }
    
    const users = usersResult.data || usersResult.users || [];
    console.log(`Found ${users.length} users`);
    
    const mekaniks = users.filter(u => u.role === 'MEKANIK');
    console.log(`Found ${mekaniks.length} mekaniks\n`);

    // Step 3: Create mekaniks if none exist
    if (mekaniks.length === 0) {
      console.log('3️⃣  Creating test mekaniks...');
      
      const testMekaniks = [
        { user_id: 'MEK001', pin: '1234', name: 'Supriyanto', role: 'MEKANIK', machine: 'CNC-001' },
        { user_id: 'MEK002', pin: '1234', name: 'Sudarto', role: 'MEKANIK', machine: 'CNC-002' },
        { user_id: 'MEK003', pin: '1234', name: 'Adi Wibowo', role: 'MEKANIK', machine: 'CNC-003' },
        { user_id: 'MEK004', pin: '1234', name: 'Muh. Royyan', role: 'MEKANIK', machine: 'CNC-004' },
        { user_id: 'MEK005', pin: '1234', name: 'Isna Jaenuri', role: 'MEKANIK', machine: 'CNC-005' },
        { user_id: 'MEK006', pin: '1234', name: 'Heri Suyamto', role: 'MEKANIK', machine: 'CNC-006' },
        { user_id: 'MEK007', pin: '1234', name: 'Eko Susanto', role: 'MEKANIK', machine: 'CNC-007' },
        { user_id: 'MEK008', pin: '1234', name: 'Ricky', role: 'MEKANIK', machine: 'CNC-008' },
        { user_id: 'MEK009', pin: '1234', name: 'Anton S', role: 'MEKANIK', machine: 'CNC-009' },
        { user_id: 'MEK010', pin: '1234', name: 'Hilal M', role: 'MEKANIK', machine: 'CNC-010' },
        { user_id: 'MEK011', pin: '1234', name: 'Noverdy', role: 'MEKANIK', machine: 'CNC-011' }
      ];

      for (const mekanik of testMekaniks) {
        try {
          const result = await makeRequest('POST', '/api/auth/users', mekanik, token);
          if (result.success) {
            console.log(`✅ Created: ${mekanik.name} (${mekanik.user_id})`);
          } else {
            console.log(`❌ Failed: ${mekanik.name} - ${result.message}`);
          }
        } catch (error) {
          console.log(`❌ Error: ${mekanik.name} - ${error.message}`);
        }
      }
      
      console.log('');
    } else {
      console.log('✅ Mekaniks already exist, skipping creation\n');
    }

    // Step 4: List all mekaniks
    console.log('4️⃣  Current Mekaniks:');
    const updatedUsersResult = await makeRequest('GET', '/api/auth/users', null, token);
    const updatedMekaniks = updatedUsersResult.data.filter(u => u.role === 'MEKANIK');
    
    updatedMekaniks.forEach((mekanik, index) => {
      console.log(`   ${index + 1}. ${mekanik.name} (${mekanik.user_id}) - ${mekanik.machine}`);
    });
    
    console.log(`\n✅ Total: ${updatedMekaniks.length} mekaniks\n`);

    console.log('✅ Done!');
    console.log('');
    console.log('📝 Next step: Run create-december-sheets.js again');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestUsers();
