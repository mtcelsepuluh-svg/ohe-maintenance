/**
 * Script untuk membuat Work Time Sheets untuk semua 24 mekanik
 * Jalankan dengan: node src/scripts/createBulkWorkTimeSheets.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const WorkTimeSheet = require('../models/WorkTimeSheet');
const User = require('../models/User');

// Load environment variables
dotenv.config();

async function createBulkWorkTimeSheets() {
  try {
    console.log('🚀 Connecting to MongoDB...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ohe-maintenance');

    console.log('✅ Connected to MongoDB\n');

    // Get current month and year
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();

    console.log(`📅 Creating work time sheets for: ${month}/${year}\n`);

    // Get all active mekaniks
    const mekaniks = await User.find({
      role: 'MEKANIK',
      status: 'active'
    });

    console.log(`👷 Found ${mekaniks.length} active mekanik\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    // Create work time sheet for each mekanik
    for (let i = 0; i < mekaniks.length; i++) {
      const mekanik = mekaniks[i];

      try {
        // Check if sheet already exists
        const existingSheet = await WorkTimeSheet.findOne({
          personel_id: mekanik._id,
          month: month,
          year: year
        });

        if (existingSheet) {
          console.log(`⏭️  [${i + 1}/${mekaniks.length}] Skipped: ${mekanik.name} (already exists)`);
          skipped++;
          continue;
        }

        // Generate monthly sheet
        const sheetData = WorkTimeSheet.generateMonthlySheet(
          mekanik._id,
          mekanik.name,
          month,
          year,
          'ADMIN001'
        );

        await WorkTimeSheet.create(sheetData);
        console.log(`✓ [${i + 1}/${mekaniks.length}] Created: ${mekanik.name}`);
        created++;
      } catch (error) {
        console.error(`✗ [${i + 1}/${mekaniks.length}] Error for ${mekanik.name}: ${error.message}`);
        errors++;
      }
    }

    console.log('\n Bulk work time sheet creation completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Created: ${created}`);
    console.log(`   - Skipped: ${skipped}`);
    console.log(`   - Errors: ${errors}`);
    console.log(`   - Total Mekanik: ${mekaniks.length}`);
    console.log('\n✅ Now refresh the Work Time Sheet page in the application to see all 24 mekanik!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating bulk work time sheets:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure MongoDB is running');
    console.error('   Windows: net start MongoDB');
    console.error('2. Check MONGODB_URI in .env file');
    process.exit(1);
  }
}

createBulkWorkTimeSheets();
