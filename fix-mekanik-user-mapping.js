// Script untuk memperbaiki mapping antara Mekanik dan User
const mongoose = require('mongoose');
const Mekanik = require('./backend/src/models/Mekanik');
const User = require('./backend/src/models/User');
const WorkTimeSheet = require('./backend/src/models/WorkTimeSheet');

async function fixMapping() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ohe_maintenance');
    console.log('Connected to MongoDB\n');

    // Get all mekaniks
    const mekaniks = await Mekanik.find({ status: 'active' });
    console.log(`Total mekaniks: ${mekaniks.length}\n`);

    // Get all users
    const users = await User.find({ status: 'active' });
    console.log(`Total users: ${users.length}\n`);

    // Create mapping from machine_code to user
    const userMap = {};
    users.forEach(u => {
      userMap[u.user_id] = u._id;
    });

    console.log('=== Mekanik to User Mapping ===');
    let matched = 0;
    let notMatched = 0;

    for (const mekanik of mekaniks) {
      const userId = userMap[mekanik.machine_code];
      if (userId) {
        console.log(`✓ ${mekanik.nama_mekanik} (${mekanik.machine_code}) → User ID: ${userId}`);
        matched++;
      } else {
        console.log(`  ${mekanik.nama_mekanik} (${mekanik.machine_code}) → No user found`);
        notMatched++;
      }
    }

    console.log(`\nMatched: ${matched}, Not matched: ${notMatched}`);

    // Check work time sheets
    console.log('\n=== Work Time Sheets ===');
    const sheets = await WorkTimeSheet.find({ month: 10, year: 2026 });
    console.log(`Total sheets: ${sheets.length}`);
    
    for (const sheet of sheets) {
      console.log(`- ${sheet.personel_name} (Personel ID: ${sheet.personel_id})`);
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
}

fixMapping();
