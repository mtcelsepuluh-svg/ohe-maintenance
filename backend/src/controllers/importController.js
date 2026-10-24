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
        const durasi = row['Durasi ( dlm menit )'] || row['Durasi (dalam menit)'];

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

        if (!durasi) {
          errors.push(`Row ${rowNum}: Durasi (dalam menit) is required`);
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

        // Parse duration
        const durasiMenit = Number(durasi);
        
        if (isNaN(durasiMenit) || durasiMenit <= 0) {
          errors.push(`Row ${rowNum}: Durasi must be a positive number`);
          continue;
        }

        // Parse optional fields
        let kategoriPekerjaan = row['Kategori Pekerjaan'] || 'Preventive';
        const pekerjaanIndirect = row['Pekerjaan Indirect'] || '';
        const durasiIndirect = row['Durasi waktu Indirect'] || 0;
        const lossTime = row['Loss Time'] || '';
        const durasiLossTime = row['Durasi waktu Loss Time'] || 0;

        // Normalize category
        kategoriPekerjaan = kategoriPekerjaan.trim();
        
        // Auto-categorize: if kategori contains "Indirect", move to Indirect Time
        let isIndirect = false;
        if (kategoriPekerjaan.toLowerCase().includes('indirect')) {
          isIndirect = true;
          kategoriPekerjaan = 'Indirect';
        }

        // Validate category
        const validCategories = ['Corective', 'Preventive', 'Proyek', 'Indirect'];
        if (!validCategories.includes(kategoriPekerjaan)) {
          errors.push(`Row ${rowNum}: Invalid Kategori Pekerjaan. Must be one of: ${validCategories.join(', ')}`);
          continue;
        }
        
        validRecords.push({
          nama: String(nama).trim(),
          jenis_pekerjaan: String(jenisPekerjaan).trim(),
          date: dateValue,
          waktu: dateValue,
          actual_time_min: durasiMenit,
          kategori_pekerjaan: kategoriPekerjaan,
          // If category is Indirect, set pekerjaan_indirect and durasi_indirect_min
          pekerjaan_indirect: isIndirect ? String(jenisPekerjaan).trim() : String(pekerjaanIndirect).trim(),
          durasi_indirect_min: isIndirect ? durasiMenit : (Number(durasiIndirect) || 0),
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
