/**
 * Script untuk update daftar mekanik
 * Jalankan dengan: node src/scripts/updateMekanik.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Mekanik = require('../models/Mekanik');

// Load environment variables
dotenv.config();

// Daftar 24 mekanik
const mekanikList = [
  { nama: 'Suhayat', machine_code: 'MEK-001' },
  { nama: 'Agus Purnomo', machine_code: 'MEK-002' },
  { nama: 'Supriyanto', machine_code: 'MEK-003' },
  { nama: 'Anton Triyono', machine_code: 'MEK-004' },
  { nama: 'Heri Suyamto', machine_code: 'MEK-005' },
  { nama: 'Sumardi', machine_code: 'MEK-006' },
  { nama: 'Yanto Suseno', machine_code: 'MEK-007' },
  { nama: 'Adi Wibowo', machine_code: 'MEK-008' },
  { nama: 'Sudarto', machine_code: 'MEK-009' },
  { nama: 'Eko Susanto', machine_code: 'MEK-010' },
  { nama: 'Suhara', machine_code: 'MEK-011' },
  { nama: 'Muhammad Royyan', machine_code: 'MEK-012' },
  { nama: 'Kresma Ricky', machine_code: 'MEK-013' },
  { nama: 'Aji Prasetyo', machine_code: 'MEK-014' },
  { nama: 'Rikhzal Adi S', machine_code: 'MEK-015' },
  { nama: 'Henricus Antama S', machine_code: 'MEK-016' },
  { nama: 'Oqi Fajar C', machine_code: 'MEK-017' },
  { nama: 'Hilal. M', machine_code: 'MEK-018' },
  { nama: 'Ade Usman', machine_code: 'MEK-019' },
  { nama: 'Puji Triyono', machine_code: 'MEK-020' },
  { nama: 'Isna Jainuri', machine_code: 'MEK-021' },
  { nama: 'Noverdy K', machine_code: 'MEK-022' },
  { nama: 'Reza Budiawan', machine_code: 'MEK-023' },
  { nama: 'Yohanes Tri Sapto', machine_code: 'MEK-024' }
];

async function updateMekanik() {
  try {
    console.log('🚀 Connecting to MongoDB...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ohe-maintenance');

    console.log('✅ Connected to MongoDB\n');

    // Hapus semua data mekanik lama (opsional, comment out jika tidak ingin hapus)
    console.log('🗑️  Removing old mekanik data...');
    await Mekanik.deleteMany({});
    console.log('✓ Old data removed\n');

    // Insert 24 mekanik baru
    console.log('👷 Adding 24 new mekanik...\n');
    
    for (let i = 0; i < mekanikList.length; i++) {
      const mekanik = mekanikList[i];
      
      await Mekanik.create({
        nama_mekanik: mekanik.nama,
        machine_code: mekanik.machine_code,
        machine_name: `Machine ${mekanik.nama}`,
        target_ohe: 85,
        benchmark_ohe: 90,
        status: 'active'
      });
      
      console.log(`✓ [${i + 1}/24] ${mekanik.nama} (${mekanik.machine_code})`);
    }

    console.log('\n🎉 Successfully updated 24 mekanik!');
    console.log('\n📊 Summary:');
    console.log(`   - Total mekanik: ${mekanikList.length}`);
    console.log('   - All mekanik status: active');
    console.log('   - Default target OHE: 85%');
    console.log('   - Default benchmark OHE: 90%');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error updating mekanik:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure MongoDB is running');
    console.error('   Windows: net start MongoDB');
    console.error('2. Check MONGODB_URI in .env file');
    process.exit(1);
  }
}

updateMekanik();
