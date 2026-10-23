const XLSX = require('xlsx');
const OHEInput = require('../models/OHEInput');
const Log = require('../models/Log');
const OHECalculator = require('../utils/OHECalculator');

// @desc    Import activities from Excel/CSV file
// @route   POST /api/import/activities
// @access  Private
const importActivities = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Parse Excel file from buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({
        success: false,
        message: 'No sheets found in Excel file'
      });
    }
    
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    if (!rawData || rawData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No data found in Excel file'
      });
    }

    // Validate and transform data
    const errors = [];
    const validRecords = [];
    
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNum = i + 2; // Excel row number (header is row 1)
      
      try {
        // Validate required fields
        const nama = row['Nama'];
        const jenisPekerjaan = row['Jenis Pekerjaan'];
        const tanggal = row['Tanggal'];
        const jamMulai = row['Jam Mulai'];
        const jamSelesai = row['Jam Selesai'];
        
        if (!nama) {
          errors.push(`Row ${rowNum}: Nama is required`);
          continue;
        }
        
        if (!jenisPekerjaan) {
          errors.push(`Row ${rowNum}: Jenis Pekerjaan is required`);
          continue;
        }
        
        if (!tanggal) {
          errors.push(`Row ${rowNum}: Tanggal is required`);
          continue;
        }
        
        if (!jamMulai) {
          errors.push(`Row ${rowNum}: Jam Mulai is required`);
          continue;
        }
        
        if (!jamSelesai) {
          errors.push(`Row ${rowNum}: Jam Selesai is required`);
          continue;
        }
        
        // Parse date (handle Excel date format)
        let dateValue;
        if (typeof tanggal === 'number') {
          // Excel date serial number
          dateValue = XLSX.SSF.parse_date_code(tanggal);
          dateValue = new Date(dateValue.y, dateValue.m - 1, dateValue.d);
        } else {
          dateValue = new Date(tanggal);
        }
        
        if (isNaN(dateValue.getTime())) {
          errors.push(`Row ${rowNum}: Invalid date format`);
          continue;
        }
        
        // Parse times (handle Excel time format or string)
        let jamMulaiStr, jamSelesaiStr;
        
        if (typeof jamMulai === 'number') {
          // Excel time is fraction of day
          const hours = Math.floor(jamMulai * 24);
          const minutes = Math.round((jamMulai * 24 - hours) * 60);
          jamMulaiStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        } else {
          jamMulaiStr = String(jamMulai).trim();
        }
        
        if (typeof jamSelesai === 'number') {
          const hours = Math.floor(jamSelesai * 24);
          const minutes = Math.round((jamSelesai * 24 - hours) * 60);
          jamSelesaiStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        } else {
          jamSelesaiStr = String(jamSelesai).trim();
        }
        
        // Validate time format
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(jamMulaiStr)) {
          errors.push(`Row ${rowNum}: Invalid Jam Mulai format (should be HH:MM)`);
          continue;
        }
        
        if (!timeRegex.test(jamSelesaiStr)) {
          errors.push(`Row ${rowNum}: Invalid Jam Selesai format (should be HH:MM)`);
          continue;
        }
        
        // Calculate duration
        const startTime = new Date(`2000-01-01 ${jamMulaiStr}`);
        const endTime = new Date(`2000-01-01 ${jamSelesaiStr}`);
        
        if (endTime <= startTime) {
          errors.push(`Row ${rowNum}: Jam Selesai must be after Jam Mulai`);
          continue;
        }
        
        const durasiMenit = Math.round((endTime - startTime) / 60000);
        
        // Parse optional fields
        const durasiDariExcel = row['Durasi ( dlm menit )'] || row['Durasi (dalam menit)'] || durasiMenit;
        const kategoriPekerjaan = row['Kategori Pekerjaan'] || 'Preventive';
        const pekerjaanIndirect = row['Pekerjaan Indirect'] || '';
        const durasiIndirect = row['Durasi waktu Indirect'] || 0;
        const lossTime = row['Loss Time'] || '';
        const durasiLossTime = row['Durasi waktu Loss Time'] || 0;
        
        // Validate category
        const validCategories = ['Corective', 'Preventive', 'Proyek'];
        if (!validCategories.includes(kategoriPekerjaan)) {
          errors.push(`Row ${rowNum}: Invalid Kategori Pekerjaan. Must be one of: ${validCategories.join(', ')}`);
          continue;
        }
        
        validRecords.push({
          nama: String(nama).trim(),
          jenis_pekerjaan: String(jenisPekerjaan).trim(),
          date: dateValue,
          waktu: dateValue, // Set waktu to the same as date
          jam_mulai: jamMulaiStr,
          jam_selesai: jamSelesaiStr,
          actual_time_min: Number(durasiDariExcel),
          kategori_pekerjaan: kategoriPekerjaan,
          pekerjaan_indirect: String(pekerjaanIndirect).trim(),
          durasi_indirect_min: Number(durasiIndirect) || 0,
          loss_time: String(lossTime).trim(),
          durasi_loss_time_min: Number(durasiLossTime) || 0
        });
        
      } catch (error) {
        errors.push(`Row ${rowNum}: ${error.message}`);
      }
    }
    
    // Create valid records
    const createdRecords = [];
    const createErrors = [];
    
    for (const record of validRecords) {
      try {
        const record_id = await OHEInput.generateRecordId();
        
        const oheInput = await OHEInput.create({
          ...record,
          record_id,
          created_by: req.user.user_id
        });
        
        createdRecords.push(oheInput);
      } catch (error) {
        createErrors.push(`Failed to create record for ${record.nama} on ${record.date}: ${error.message}`);
      }
    }
    
    // Log activity
    if (createdRecords.length > 0) {
      await Log.create({
        user: req.user.user_id,
        action: 'create',
        module: 'ohe_input',
        description: `Imported ${createdRecords.length} activities from Excel`
      });
    }
    
    res.json({
      success: true,
      message: `Successfully imported ${createdRecords.length} records`,
      data: {
        total_rows: rawData.length,
        valid_records: validRecords.length,
        created_records: createdRecords.length,
        errors: [...errors, ...createErrors]
      }
    });
    
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({
      success: false,
      message: `Import failed: ${error.message}`
    });
  }
};

module.exports = {
  importActivities
};
