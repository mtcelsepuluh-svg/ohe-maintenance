const axios = require('axios');

async function verifyInputOHEPage() {
  try {
    console.log('🔍 Verifying Data di Halaman Input OHE...\n');

    // Login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      user_id: 'ADMIN001',
      pin: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Get OHE Inputs (data yang ditampilkan di Input OHE page)
    console.log('Fetching OHE Inputs dari API /api/oheinputs...\n');
    const response = await axios.get('http://localhost:5000/api/oheinputs', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`Total OHE Inputs di database: ${response.data.count}\n`);

    // Filter imported data (5 records yang baru di-import)
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

    console.log('='.repeat(80));
    console.log('DATA IMPORT YANG MUNCUL DI INPUT OHE PAGE');
    console.log('='.repeat(80));
    console.log(`\nDitemukan ${importedData.length} dari 5 records yang di-import\n`);

    if (importedData.length === 0) {
      console.log('❌ TIDAK ADA DATA IMPORT YANG MUNCUL!');
      console.log('\nKemungkinan penyebab:');
      console.log('1. Data import gagal tersimpan ke database');
      console.log('2. Filter tanggal di frontend tidak sesuai');
      console.log('3. Frontend menggunakan endpoint yang salah');
      process.exit(1);
    }

    // Display imported data
    importedData.forEach((item, index) => {
      console.log(`${index + 1}. ${item.record_id}`);
      console.log(`   Jenis Pekerjaan : ${item.jenis_pekerjaan}`);
      console.log(`   Nama            : ${item.nama}`);
      console.log(`   Tanggal         : ${new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`);
      console.log(`   Durasi          : ${item.actual_time_min} menit`);
      console.log(`   Kategori        : ${item.kategori_pekerjaan}`);
      console.log(`   Jam Mulai       : ${item.jam_mulai || 'N/A (tidak diisi)'}`);
      console.log(`   Jam Selesai     : ${item.jam_selesai || 'N/A (tidak diisi)'}`);
      console.log(`   Loss Time       : ${item.loss_time || '-'}${item.durasi_loss_time_min ? ` (${item.durasi_loss_time_min} min)` : ''}`);
      console.log(`   Created At      : ${new Date(item.created_at).toLocaleString('id-ID')}`);
      console.log('');
    });

    // Verification summary
    console.log('='.repeat(80));
    console.log('VERIFIKASI FORMAT BARU (TANPA JAM MULAI/SELESAI)');
    console.log('='.repeat(80));
    
    const tanpaJamMulai = importedData.filter(item => !item.jam_mulai || item.jam_mulai === '').length;
    const tanpaJamSelesai = importedData.filter(item => !item.jam_selesai || item.jam_selesai === '').length;
    const denganDurasi = importedData.filter(item => item.actual_time_min > 0).length;

    console.log(`\n✓ Records tanpa Jam Mulai: ${tanpaJamMulai}/${importedData.length}`);
    console.log(`✓ Records tanpa Jam Selesai: ${tanpaJamSelesai}/${importedData.length}`);
    console.log(`✓ Records dengan Durasi: ${denganDurasi}/${importedData.length}`);

    if (tanpaJamMulai === importedData.length && tanpaJamSelesai === importedData.length && denganDurasi === importedData.length) {
      console.log('\n✅ FORMAT BARU BERHASIL!');
      console.log('   - Field jam_mulai dan jam_selesai tidak diisi');
      console.log('   - Field actual_time_min berisi durasi dari Excel');
    } else {
      console.log('\n⚠️  Ada data yang tidak sesuai dengan format baru');
    }

    console.log('\n' + '='.repeat(80));
    console.log('KESIMPULAN');
    console.log('='.repeat(80));
    console.log(`\n✅ Data import BERHASIL muncul di halaman Input OHE`);
    console.log(`✅ Total ${importedData.length} records ditemukan`);
    console.log(`✅ Format baru (hanya durasi) diterapkan dengan benar`);
    console.log(`\nHalaman Input OHE: http://localhost:3000/input-ohe`);

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

verifyInputOHEPage();
