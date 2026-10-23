# Google Sheets Integration - Setup Guide

## 📋 Prerequisites

Untuk mengintegrasikan aplikasi dengan Google Forms/Sheets, Anda perlu:

1. **Google Account** dengan akses ke Google Forms
2. **Google Cloud Project** untuk API credentials
3. **Google Sheets API** enabled
4. **Service Account** untuk authentication

## 🚀 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Login dengan Google account Anda
3. Klik dropdown project di atas
4. Klik **"NEW PROJECT"**
5. Isi nama project: `OHE Maintenance Integration`
6. Klik **"CREATE"**
7. Tunggu beberapa detik hingga project terbuat

### Step 2: Enable Google Sheets API

1. Di Google Cloud Console, buka menu **☰** > **APIs & Services** > **Library**
2. Search: `Google Sheets API`
3. Klik **Google Sheets API**
4. Klik tombol **"ENABLE"**
5. Tunggu hingga API enabled

### Step 3: Create Service Account

1. Buka menu **☰** > **APIs & Services** > **Credentials**
2. Klik **"+ CREATE CREDENTIALS"** > **"Service account"**
3. Isi details:
   - **Service account name**: `ohe-maintenance-sync`
   - **Service account ID**: `ohe-maintenance-sync`
   - **Description**: `Service account for OHE Maintenance Google Sheets sync`
4. Klik **"CREATE AND CONTINUE"**
5. Untuk role, pilih: **Basic** > **Editor**
6. Klik **"CONTINUE"**
7. Skip "Grant users access to this service account"
8. Klik **"DONE"**

### Step 4: Download Service Account Credentials

1. Di halaman Credentials, cari service account yang baru dibuat
2. Klik nama service account
3. Klik tab **"KEYS"**
4. Klik **"ADD KEY"** > **"Create new key"**
5. Pilih **JSON**
6. Klik **"CREATE"**
7. File JSON akan ter-download (contoh: `ohe-maintenance-sync-xxxxx.json`)
8. **PENTING**: Simpan file ini dengan aman, jangan share ke siapa pun!

### Step 5: Share Google Sheets dengan Service Account

1. Buka file JSON yang baru di-download
2. Cari field `client_email` (contoh: `ohe-maintenance-sync@project-id.iam.gserviceaccount.com`)
3. Copy email tersebut
4. Buka Google Sheets yang terhubung dengan Google Forms:
   - Buka Google Forms Anda
   - Klik tab **"Responses"**
   - Klik icon Google Sheets (📊) untuk buka spreadsheet
5. Di Google Sheets, klik tombol **"Share"**
6. Paste email service account
7. Pilih role: **Editor**
8. Klik **"Send"**

### Step 6: Get Spreadsheet ID

1. Di URL Google Sheets, copy ID spreadsheet:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
2. Contoh:
   ```
   https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/edit
   ```
   Spreadsheet ID: `1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`

### Step 7: Configure Backend

1. Copy file JSON credentials ke folder backend:
   ```bash
   cp /path/to/downloaded/credentials.json ohe-maintenance/backend/config/google-credentials.json
   ```

2. Update file `.env` di backend:
   ```env
   GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
   GOOGLE_SHEETS_RANGE=Sheet1!A:Z
   GOOGLE_SYNC_INTERVAL=300000
   ```

3. Install dependencies:
   ```bash
   cd ohe-maintenance/backend
   npm install googleapis node-cron
   ```

4. Restart backend server:
   ```bash
   npm run dev
   ```

## 🔐 Security Notes

- **JANGAN** commit `google-credentials.json` ke Git
- File sudah ditambahkan di `.gitignore`
- Jika credentials bocor, segera revoke di Google Cloud Console
- Gunakan service account dengan minimal permissions

## 📊 Data Mapping

Berdasarkan struktur Google Forms:

| Google Form Field | Kolom di Sheets | Mapping di Aplikasi |
|-------------------|-----------------|---------------------|
| Nama | C | mekanik |
| Jenis Pekerjaan | D | activity_name (Value Time) |
| Kategori Pekerjaan | E | category (Corective/Preventive/Proyek) |
| Waktu | F | date |
| Jam Mulai | G | start_time |
| Jam Selesai | H | end_time |
| Pemakaian Bahan | I | pemakaian_bahan |
| Pekerjaan Indirect | J | indirect_activities |
| Durasi waktu Indirect | K | durasi_indirect_min |
| Loss Time | L | loss_time_activities |
| Durasi waktu Loss Time | M | durasi_loss_time_min |

**Catatan**: Mapping kolom mungkin berbeda, perlu verifikasi setelah data masuk

## 🧪 Testing

### Test Connection

```bash
cd ohe-maintenance/backend
node test-google-connection.js
```

### Manual Sync

```bash
curl -X POST http://localhost:5000/api/google-sync/sync \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Sync Status

```bash
curl -X GET http://localhost:5000/api/google-sync/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 Troubleshooting

### Error: "Unable to parse credentials"
- Pastikan file JSON valid
- Check format file `google-credentials.json`

### Error: "Permission denied"
- Pastikan service account email sudah di-share ke Google Sheets
- Check role: harus **Editor**

### Error: "Spreadsheet not found"
- Check `GOOGLE_SHEETS_SPREADSHEET_ID` di `.env`
- Pastikan ID benar (dari URL)

### Data tidak sync
- Check backend logs
- Check sync scheduler running
- Manual sync untuk test

## 📞 Support

Jika ada masalah saat setup:
1. Check Google Cloud Console untuk error messages
2. Check backend logs di terminal
3. Verify semua steps sudah diikuti dengan benar
4. Test manual sync untuk debug

---

**Status**: ⏳ Waiting for Google Cloud Setup

Setelah setup Google Cloud selesai, jalankan:
```bash
npm install googleapis node-cron
```

Lalu restart backend dan fitur auto-sync akan aktif!
