/**
 * Script untuk update daftar mekanik sebagai User
 * Jalankan dengan: node src/scripts/updateMekanikUsers.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Daftar 24 mekanik
const mekanikList = [
  { nama: 'Suhayat', user_id: 'MEK001' },
  { nama: 'Agus Purnomo', user_id: 'MEK002' },
  { nama: 'Supriyanto', user_id: 'MEK003' },
  { nama: 'Anton Triyono', user_id: 'MEK004' },
  { nama: 'Heri Suyamto', user_id: 'MEK005' },
  { nama: 'Sumardi', user_id: 'MEK006' },
  { nama: 'Yanto Suseno', user_id: 'MEK007' },
  { nama: 'Adi Wibowo', user_id: 'MEK008' },
  { nama: 'Sudarto', user_id: 'MEK009' },
  { nama: 'Eko Susanto', user_id: 'MEK010' },
  { nama: 'Suhara', user_id: 'MEK011' },
  { nama: 'Muhammad Royyan', user_id: 'MEK012' },
  { nama: 'Kresma Ricky', user_id: 'MEK013' },
  { nama: 'Aji Prasetyo', user_id: 'MEK014' },
  { nama: 'Rikhzal Adi S', user_id: 'MEK015' },
  { nama: 'Henricus Antama S', user_id: 'MEK016' },
  { nama: 'Oqi Fajar C', user_id: 'MEK017' },
  { nama: 'Hilal. M', user_id: 'MEK018' },
  { nama: 'Ade Usman', user_id: 'MEK019' },
  { nama: 'Puji Triyono', user_id: 'MEK020' },
  { nama: 'Isna Jainuri', user_id: 'MEK021' },
  { nama: 'Noverdy K', user_id: 'MEK022' },
  { nama: 'Reza Budiawan', user_id: 'MEK023' },
  { nama: 'Yohanes Tri Sapto', user_id: 'MEK024' }
];

async function updateMekanikUsers() {
  try {
    console.log('🚀 Connecting to MongoDB...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ohe-maintenance');

    console.log('✅ Connected to MongoDB\n');

    // Hash default PIN
    const defaultPin = '1234';
    const hashedPin = await bcrypt.hash(defaultPin, 10);

    // Insert or update 24 mekanik as Users
    console.log('👷 Adding/Updating 24 mekanik as Users...\n');
    
    let created = 0;
    let updated = 0;
    
    for (let i = 0; i < mekanikList.length; i++) {
      const mekanik = mekanikList[i];
      
      // Check if user already exists
      const existingUser = await User.findOne({ user_id: mekanik.user_id });
      
      if (existingUser) {
        // Update existing user
        existingUser.name = mekanik.nama;
        existingUser.role = 'MEKANIK';
        existingUser.machine = mekanik.user_id;
        existingUser.status = 'active';
        await existingUser.save();
        
        console.log(`✓ [${i + 1}/24] Updated: ${mekanik.nama} (${mekanik.user_id})`);
        updated++;
      } else {
        // Create new user
        await User.create({
          user_id: mekanik.user_id,
          pin: hashedPin,
          name: mekanik.nama,
          role: 'MEKANIK',
          machine: mekanik.user_id,
          status: 'active'
        });
        
        console.log(`✓ [${i + 1}/24] Created: ${mekanik.nama} (${mekanik.user_id})`);
        created++;
      }
    }

    console.log('\n🎉 Successfully processed 24 mekanik!');
    console.log('\n📊 Summary:');
    console.log(`   - Created: ${created}`);
    console.log(`   - Updated: ${updated}`);
    console.log(`   - Total: ${mekanikList.length}`);
    console.log('\n🔐 Login credentials for all mekanik:');
    console.log(`   User ID: MEK001 to MEK024`);
    console.log(`   PIN: ${defaultPin}`);
    console.log('\n⚠️  IMPORTANT: Change default PINs after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error updating mekanik users:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure MongoDB is running');
    console.error('   Windows: net start MongoDB');
    console.error('2. Check MONGODB_URI in .env file');
    process.exit(1);
  }
}

updateMekanikUsers();
