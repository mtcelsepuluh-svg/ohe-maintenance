/**
 * Script untuk membersihkan data duplikat work time sheets
 * Jalankan dengan: node src/scripts/cleanupDuplicateWorkTimeSheets.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const WorkTimeSheet = require('../models/WorkTimeSheet');
const User = require('../models/User');

// Load environment variables
dotenv.config();

async function cleanupDuplicates() {
  try {
    console.log(' Connecting to MongoDB...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ohe-maintenance');

    console.log('✅ Connected to MongoDB\n');

    // Get current month and year
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    console.log(` Cleaning up duplicate work time sheets for: ${month}/${year}\n`);

    // Get all work time sheets for current month
    const sheets = await WorkTimeSheet.find({ month, year });
    
    console.log(`📊 Found ${sheets.length} total work time sheets\n`);

    // Group by personel_id
    const grouped = {};
    for (const sheet of sheets) {
      const personelId = sheet.personel_id.toString();
      if (!grouped[personelId]) {
        grouped[personelId] = [];
      }
      grouped[personelId].push(sheet);
    }

    let deleted = 0;
    let kept = 0;

    // For each personel, keep only the latest sheet
    for (const [personelId, sheets] of Object.entries(grouped)) {
      if (sheets.length > 1) {
        // Sort by created_at descending
        sheets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Keep the first one (latest), delete the rest
        const toKeep = sheets[0];
        const toDelete = sheets.slice(1);
        
        console.log(`👤 ${toKeep.personel_name}:`);
        console.log(`   ✓ Keeping: ${toKeep._id} (created: ${toKeep.created_at})`);
        
        for (const sheet of toDelete) {
          await WorkTimeSheet.deleteOne({ _id: sheet._id });
          console.log(`   🗑️  Deleted: ${sheet._id} (created: ${sheet.created_at})`);
          deleted++;
        }
        kept++;
      } else {
        kept++;
      }
    }

    console.log('\n Cleanup completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Kept: ${kept}`);
    console.log(`   - Deleted: ${deleted}`);
    console.log(`   - Total unique personel: ${Object.keys(grouped).length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error cleaning up duplicates:', error.message);
    process.exit(1);
  }
}

cleanupDuplicates();
