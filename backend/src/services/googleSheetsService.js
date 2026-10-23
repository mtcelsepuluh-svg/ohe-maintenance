const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.auth = null;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    this.range = process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A:Z';
  }

  // Initialize Google Sheets API client
  async initialize() {
    try {
      const credentialsPath = path.join(__dirname, '../config/google-credentials.json');
      
      if (!fs.existsSync(credentialsPath)) {
        throw new Error('Google credentials file not found');
      }

      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      console.log('✅ Google Sheets API initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Sheets API:', error.message);
      return false;
    }
  }

  // Fetch data from Google Sheets
  async fetchData() {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      if (!this.spreadsheetId) {
        throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID not configured');
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.range,
      });

      const rows = response.data.values;
      
      if (!rows || rows.length === 0) {
        console.log('No data found in Google Sheets');
        return [];
      }

      console.log(`✅ Fetched ${rows.length} rows from Google Sheets`);
      return rows;
    } catch (error) {
      console.error('❌ Error fetching data from Google Sheets:', error.message);
      throw error;
    }
  }

  // Parse Google Sheets data to OHE Input format
  parseData(rows) {
    try {
      if (!rows || rows.length < 2) {
        return [];
      }

      const headers = rows[0];
      const dataRows = rows.slice(1); // Skip header row

      // Find column indexes
      const columnIndex = {
        timestamp: headers.findIndex(h => h.toLowerCase().includes('timestamp')),
        email: headers.findIndex(h => h.toLowerCase().includes('email')),
        nama: headers.findIndex(h => h.toLowerCase().includes('nama')),
        jenisPekerjaan: headers.findIndex(h => h.toLowerCase().includes('jenis pekerjaan')),
        kategoriPekerjaan: headers.findIndex(h => h.toLowerCase().includes('kategori pekerjaan')),
        waktu: headers.findIndex(h => h.toLowerCase() === 'waktu'),
        jamMulai: headers.findIndex(h => h.toLowerCase().includes('jam mulai')),
        jamSelesai: headers.findIndex(h => h.toLowerCase().includes('jam selesai')),
        pemakaianBahan: headers.findIndex(h => h.toLowerCase().includes('pemakaian bahan')),
        pekerjaanIndirect: headers.findIndex(h => h.toLowerCase().includes('pekerjaan indirect')),
        durasiIndirect: headers.findIndex(h => h.toLowerCase().includes('durasi waktu indirect')),
        lossTime: headers.findIndex(h => h.toLowerCase() === 'loss time'),
        durasiLossTime: headers.findIndex(h => h.toLowerCase().includes('durasi waktu loss time')),
      };

      const parsedData = [];

      dataRows.forEach((row, index) => {
        if (!row || row.length === 0) return;

        const entry = {
          timestamp: row[columnIndex.timestamp] || null,
          email: row[columnIndex.email] || null,
          nama: row[columnIndex.nama] || null,
          jenisPekerjaan: row[columnIndex.jenisPekerjaan] || null,
          kategoriPekerjaan: row[columnIndex.kategoriPekerjaan] || null,
          waktu: row[columnIndex.waktu] || null,
          jamMulai: row[columnIndex.jamMulai] || null,
          jamSelesai: row[columnIndex.jamSelesai] || null,
          pemakaianBahan: row[columnIndex.pemakaianBahan] || null,
          pekerjaanIndirect: row[columnIndex.pekerjaanIndirect] || null,
          durasiIndirect: row[columnIndex.durasiIndirect] || null,
          lossTime: row[columnIndex.lossTime] || null,
          durasiLossTime: row[columnIndex.durasiLossTime] || null,
        };

        // Calculate actual time if start and end time are provided
        if (entry.jamMulai && entry.jamSelesai) {
          entry.actualTimeMin = this.calculateActualTime(entry.jamMulai, entry.jamSelesai);
        }

        parsedData.push(entry);
      });

      console.log(`✅ Parsed ${parsedData.length} entries`);
      return parsedData;
    } catch (error) {
      console.error('❌ Error parsing data:', error.message);
      throw error;
    }
  }

  // Calculate actual time in minutes from start and end time
  calculateActualTime(startTime, endTime) {
    try {
      // Parse time strings (format: HH:MM or H:MM)
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      const startTotalMinutes = startHours * 60 + startMinutes;
      let endTotalMinutes = endHours * 60 + endMinutes;

      // Handle overnight (end time is next day)
      if (endTotalMinutes < startTotalMinutes) {
        endTotalMinutes += 24 * 60; // Add 24 hours
      }

      const duration = endTotalMinutes - startTotalMinutes;
      return duration;
    } catch (error) {
      console.error('❌ Error calculating actual time:', error.message);
      return 0;
    }
  }

  // Transform parsed data to OHE Input format
  transformToOHEInput(parsedData) {
    const oheInputs = [];

    parsedData.forEach((entry, index) => {
      if (!entry.nama || !entry.waktu) {
        console.log(`Skipping entry ${index}: missing required fields`);
        return;
      }

      // Value Time entry
      if (entry.jenisPekerjaan && entry.kategoriPekerjaan) {
        oheInputs.push({
          record_id: `GOOGLE-${Date.now()}-${index}-VT`,
          date: this.parseDate(entry.waktu),
          nama: entry.nama,
          jenis_pekerjaan: entry.jenisPekerjaan,
          kategori_pekerjaan: this.normalizeKategori(entry.kategoriPekerjaan),
          waktu: this.parseDate(entry.waktu),
          jam_mulai: entry.jamMulai || '00:00',
          jam_selesai: entry.jamSelesai || '00:00',
          actual_time_min: entry.actualTimeMin || 0,
          standard_time_min: 0, // Will be calculated based on activity
          pemakaian_bahan: entry.pemakaianBahan || '',
          pekerjaan_indirect: '',
          durasi_indirect_min: 0,
          loss_time: '',
          durasi_loss_time_min: 0,
          created_by: 'GOOGLE_SYNC',
        });
      }

      // Indirect Time entry
      if (entry.pekerjaanIndirect && entry.durasiIndirect) {
        const indirectActivities = entry.pekerjaanIndirect.split(',').map(a => a.trim());
        const durasiIndirect = parseInt(entry.durasiIndirect) || 0;

        indirectActivities.forEach((activity, actIndex) => {
          oheInputs.push({
            record_id: `GOOGLE-${Date.now()}-${index}-IND-${actIndex}`,
            date: this.parseDate(entry.waktu),
            nama: entry.nama,
            jenis_pekerjaan: activity,
            kategori_pekerjaan: 'INDIRECT',
            waktu: this.parseDate(entry.waktu),
            jam_mulai: entry.jamMulai || '00:00',
            jam_selesai: entry.jamSelesai || '00:00',
            actual_time_min: Math.round(durasiIndirect / indirectActivities.length),
            standard_time_min: 0,
            pemakaian_bahan: '',
            pekerjaan_indirect: activity,
            durasi_indirect_min: Math.round(durasiIndirect / indirectActivities.length),
            loss_time: '',
            durasi_loss_time_min: 0,
            created_by: 'GOOGLE_SYNC',
          });
        });
      }

      // Loss Time entry
      if (entry.lossTime && entry.durasiLossTime) {
        const lossActivities = entry.lossTime.split(',').map(a => a.trim());
        const durasiLoss = parseInt(entry.durasiLossTime) || 0;

        lossActivities.forEach((activity, actIndex) => {
          oheInputs.push({
            record_id: `GOOGLE-${Date.now()}-${index}-LOSS-${actIndex}`,
            date: this.parseDate(entry.waktu),
            nama: entry.nama,
            jenis_pekerjaan: activity,
            kategori_pekerjaan: 'LOSS',
            waktu: this.parseDate(entry.waktu),
            jam_mulai: entry.jamMulai || '00:00',
            jam_selesai: entry.jamSelesai || '00:00',
            actual_time_min: Math.round(durasiLoss / lossActivities.length),
            standard_time_min: 0,
            pemakaian_bahan: '',
            pekerjaan_indirect: '',
            durasi_indirect_min: 0,
            loss_time: activity,
            durasi_loss_time_min: Math.round(durasiLoss / lossActivities.length),
            created_by: 'GOOGLE_SYNC',
          });
        });
      }
    });

    console.log(`✅ Transformed ${oheInputs.length} OHE inputs`);
    return oheInputs;
  }

  // Helper: Parse date string to Date object
  parseDate(dateStr) {
    try {
      if (!dateStr) return new Date();
      
      // Handle various date formats
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date;
      }

      // Try DD/MM/YYYY format
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }

      return new Date();
    } catch (error) {
      return new Date();
    }
  }

  // Helper: Normalize kategori pekerjaan
  normalizeKategori(kategori) {
    const normalized = kategori.toLowerCase().trim();
    if (normalized.includes('corrective') || normalized.includes('corective')) {
      return 'Corective';
    }
    if (normalized.includes('preventive')) {
      return 'Preventive';
    }
    if (normalized.includes('proyek') || normalized.includes('project')) {
      return 'Proyek';
    }
    return 'Corective'; // Default
  }

  // Sync data from Google Sheets to database
  async syncData() {
    try {
      console.log('🔄 Starting Google Sheets sync...');

      // Fetch data from Google Sheets
      const rows = await this.fetchData();
      
      if (rows.length === 0) {
        console.log('No data to sync');
        return { success: true, message: 'No data to sync', count: 0 };
      }

      // Parse data
      const parsedData = this.parseData(rows);
      
      if (parsedData.length === 0) {
        console.log('No valid entries found');
        return { success: true, message: 'No valid entries found', count: 0 };
      }

      // Transform to OHE Input format
      const oheInputs = this.transformToOHEInput(parsedData);

      console.log(`✅ Sync completed: ${oheInputs.length} entries created`);
      
      return {
        success: true,
        message: 'Sync completed successfully',
        count: oheInputs.length,
        data: oheInputs
      };
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
      return {
        success: false,
        message: error.message,
        count: 0
      };
    }
  }
}

module.exports = new GoogleSheetsService();
