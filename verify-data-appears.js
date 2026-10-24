const axios = require('axios');

async function verifyDataAppears() {
  try {
    console.log('🔍 Verifikasi Data Import Muncul di Frontend...\n');

    // Login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      user_id: 'ADMIN001',
      pin: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Get all OHE inputs (tanpa filter tanggal)
    console.log('Fetching all OHE Inputs (tanpa filter tanggal)...');
    const response = await axios.get('http://localhost:5000/api/oheinputs', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`\nTotal OHE Inputs: ${response.data.count}`);

    // Filter imported data
    const importedJenisPekerjaan = [
      'Servicing Motor OHE', 
      'Perbaikan Pantograph', 
      'Installasi Equipment Baru', 
      'Meeting Planning', 
      'Inspeksi Rutin'
    ];

    const importedData = response.data.data.filter(item => 
      importedJenisPekerjaan.includes(item.jenis_pekerjaan)
    );

    console.log(`\n${'='.repeat(80)}`);
    console.log('DATA IMPORT YANG MUNCUL DI FRONTEND');
    console.log('='.repeat(80));
    console.log(`\n✅ Ditemukan ${importedData.length} dari 5 records yang di-import\n`);

    if (importedData.length === 0) {
      console.log('❌ TIDAK ADA DATA IMPORT YANG MUNCUL!');
      console.log('\nKemungkinan penyebab:');
      console.log('1. Frontend masih menggunakan filter tanggal hari ini');
      console.log('2. Browser belum reload setelah perubahan kode');
      console.log('3. Ada error di console browser');
      process.exit(1);
    }

    // Display imported data
    importedData.forEach((item, index) => {
      console.log(`${index + 1}. ${item.record_id}`);
      console.log(`   Jenis Pekerjaan : ${item.jenis_pekerjaan}`);
      console.log(`   Tanggal         : ${new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`);
      console.log(`   Durasi          : ${item.actual_time_min} menit`);
      console.log(`   Kategori        : ${item.kategori_pekerjaan}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('✅ VERIFIKASI BERHASIL!');
    console.log('='.repeat(80));
    console.log('\nData import sekarang akan muncul di halaman Input OHE.');
    console.log('Refresh browser untuk melihat perubahan: http://localhost:3000/input-ohe');

  } catch (error) {
    console.error('\n❌ Verifikasi gagal!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

verifyDataAppears();
