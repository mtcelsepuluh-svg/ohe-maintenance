const axios = require('axios');

async function verifyData() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      user_id: 'ADMIN001',
      pin: '1234'
    });

    const token = loginRes.data.token;

    const getRes = await axios.get('http://localhost:5000/api/worktime/2026/10', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const noverdySheet = getRes.data.data.find(s => s.personel_name === 'Noverdy K');
    if (!noverdySheet) {
      console.log('Noverdy K sheet not found');
      process.exit(1);
    }

    console.log('=== Noverdy K Daily Entries ===');
    noverdySheet.daily_entries.forEach(entry => {
      const diff = entry.total_time - entry.standard_time;
      console.log(`Day ${entry.date}: total_time=${entry.total_time}, standard_time=${entry.standard_time}, diff=${diff}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

verifyData();
