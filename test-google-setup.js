// Script untuk test Google Sheets connection
const path = require('path');
const fs = require('fs');

console.log('🧪 Testing Google Sheets Setup...\n');

// Step 1: Check credentials file
console.log('1️⃣  Checking credentials file...');
const credentialsPath = path.join(__dirname, 'backend/config/google-credentials.json');

if (!fs.existsSync(credentialsPath)) {
  console.error('❌ Credentials file not found at:', credentialsPath);
  console.log('\n📝 Please:');
  console.log('   1. Download credentials JSON from Google Cloud Console');
  console.log('   2. Save it to: backend/config/google-credentials.json');
  console.log('   3. Run this script again');
  process.exit(1);
}

try {
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  console.log('✅ Credentials file found and valid');
  console.log(`   Project ID: ${credentials.project_id}`);
  console.log(`   Client Email: ${credentials.client_email}`);
} catch (error) {
  console.error('❌ Invalid JSON in credentials file:', error.message);
  process.exit(1);
}

// Step 2: Check .env file
console.log('\n2️⃣  Checking .env file...');
const envPath = path.join(__dirname, 'backend/.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found at:', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

let spreadsheetId = null;
let range = null;
let interval = null;

lines.forEach(line => {
  if (line.startsWith('GOOGLE_SHEETS_SPREADSHEET_ID=')) {
    spreadsheetId = line.split('=')[1];
  }
  if (line.startsWith('GOOGLE_SHEETS_RANGE=')) {
    range = line.split('=')[1];
  }
  if (line.startsWith('GOOGLE_SYNC_INTERVAL=')) {
    interval = line.split('=')[1];
  }
});

if (!spreadsheetId || spreadsheetId === 'your_spreadsheet_id_here') {
  console.error('❌ GOOGLE_SHEETS_SPREADSHEET_ID not configured in .env');
  console.log('\n📝 Please update backend/.env with your spreadsheet ID');
} else {
  console.log('✅ GOOGLE_SHEETS_SPREADSHEET_ID configured');
  console.log(`   Spreadsheet ID: ${spreadsheetId}`);
}

if (range) {
  console.log('✅ GOOGLE_SHEETS_RANGE configured');
  console.log(`   Range: ${range}`);
} else {
  console.log('⚠️  GOOGLE_SHEETS_RANGE not set, using default: Form Responses 1!A:Z');
}

if (interval) {
  console.log('✅ GOOGLE_SYNC_INTERVAL configured');
  console.log(`   Interval: ${interval}ms (${Math.floor(interval / 60000)} minutes)`);
} else {
  console.log('⚠️  GOOGLE_SYNC_INTERVAL not set, using default: 300000ms (5 minutes)');
}

// Step 3: Test Google Sheets API
console.log('\n3️⃣  Testing Google Sheets API connection...');

async function testAPI() {
  try {
    const { google } = require('googleapis');
    
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range || 'Form Responses 1!A:Z',
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      console.log('⚠️  Connected successfully but no data found in spreadsheet');
      console.log('   Make sure:');
      console.log('   - Spreadsheet ID is correct');
      console.log('   - Range is correct');
      console.log('   - Service account has access to the spreadsheet');
    } else {
      console.log('✅ Successfully connected to Google Sheets');
      console.log(`   Found ${rows.length} rows (including header)`);
      console.log(`   Columns: ${rows[0].join(', ')}`);
    }

    console.log('\n✅ All tests passed!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Restart backend: cd backend && npm run dev');
    console.log('   2. Open frontend: http://localhost:3000');
    console.log('   3. Navigate to "Input OHE"');
    console.log('   4. Click "Sync from Google Sheets"');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.message.includes('permission')) {
      console.log('\n📝 Permission error:');
      console.log('   - Share Google Sheets with service account email');
      console.log('   - Email:', credentials.client_email);
      console.log('   - Role: Editor');
    }
    
    if (error.message.includes('404')) {
      console.log('\n📝 Spreadsheet not found:');
      console.log('   - Check spreadsheet ID in .env');
      console.log('   - Current ID:', spreadsheetId);
    }
  }
}

testAPI();
