# 📋 Step-by-Step Guide: Setup Google Credentials & Spreadsheet ID

## Part 1: Download Credentials JSON

### Step 1: Open Google Cloud Console
1. Buka: https://console.cloud.google.com/
2. Login dengan Google account Anda
3. Pilih project yang sudah Anda buat (atau buat baru)

### Step 2: Navigate to Credentials
1. Klik menu **☰** (hamburger icon di kiri atas)
2. Pilih **APIs & Services** → **Credentials**
3. Anda akan melihat daftar service accounts

### Step 3: Find Your Service Account
1. Cari service account yang sudah Anda buat (nama: `ohe-maintenance-sync`)
2. Klik **nama service account** tersebut
3. Anda akan masuk ke halaman detail service account

### Step 4: Create Key
1. Klik tab **KEYS** (di bagian atas)
2. Klik tombol **ADD KEY** → **Create new key**
3. Pilih **JSON**
4. Klik **CREATE**
5. File JSON akan otomatis ter-download
   - Nama file contoh: `ohe-maintenance-sync-1234567890.json`
   - **PENTING**: Simpan file ini di tempat yang aman!

### Step 5: Copy Credentials to Backend
1. Buka File Explorer
2. Navigate ke folder: `C:\Users\MTCL10DODIK\ohe-maintenance\backend\config\`
3. Copy file JSON yang baru di-download ke folder ini
4. Rename file menjadi: `google-credentials.json`
   - Path final: `C:\Users\MTCL10DODIK\ohe-maintenance\backend\config\google-credentials.json`

### Step 6: Verify Credentials File
1. Buka file `google-credentials.json` dengan text editor (Notepad/VS Code)
2. Anda akan melihat struktur seperti ini:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "ohe-maintenance-sync@your-project.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  ...
}
```
3. **Copy email dari `client_email`** - ini akan digunakan untuk share Google Sheets

---

## Part 2: Find Spreadsheet ID

### Step 1: Open Google Forms
1. Buka Google Forms Anda: https://docs.google.com/forms/d/1tszEhnscPiJ-PJATD_dIv5zHwz8KkVxtuUwqahxrqRs
2. Klik tab **Responses** (di bagian atas)
3. Klik icon **Google Sheets** (📊) untuk buka spreadsheet yang terhubung

### Step 2: Get Spreadsheet ID from URL
1. Setelah Google Sheets terbuka, lihat URL di browser
2. URL akan terlihat seperti ini:
```
https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/edit#gid=0
```
3. **Spreadsheet ID** adalah bagian di antara `/d/` dan `/edit`:
```
1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```
4. **Copy ID tersebut**

### Step 3: Alternative - Get ID from Spreadsheet
1. Di Google Sheets, klik **File** → **Share**
2. Klik **Copy link**
3. Paste di Notepad
4. Extract ID dari URL

---

## Part 3: Share Google Sheets with Service Account

### Step 1: Open Share Dialog
1. Di Google Sheets, klik tombol **Share** (di kanan atas)
2. Dialog "Share with others" akan muncul

### Step 2: Add Service Account
1. Di field "Add people and groups", paste email dari `client_email`:
   ```
   ohe-maintenance-sync@your-project.iam.gserviceaccount.com
   ```
2. Tekan **Enter** atau klik untuk add
3. Pilih role: **Editor** (dari dropdown di kanan)
4. **Uncheck** "Notify people" (optional, agar tidak kirim email)
5. Klik **Send** atau **Done**

### Step 3: Verify Access
1. Service account sekarang punya akses ke spreadsheet
2. Data dari Google Forms akan otomatis masuk ke spreadsheet ini

---

## Part 4: Update .env File

### Step 1: Open .env File
1. Buka file: `C:\Users\MTCL10DODIK\ohe-maintenance\backend\.env`
2. Gunakan text editor (Notepad/VS Code)

### Step 2: Update Spreadsheet ID
1. Cari baris:
```env
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
```
2. Ganti dengan ID yang sudah Anda copy:
```env
GOOGLE_SHEETS_SPREADSHEET_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```
3. **PENTING**: Jangan ada spasi di sekitar ID

### Step 3: Verify Range (Optional)
1. Cari baris:
```env
GOOGLE_SHEETS_RANGE=Form Responses 1!A:Z
```
2. Jika sheet name berbeda, ganti dengan nama sheet Anda:
   - Buka Google Sheets
   - Lihat nama sheet di bagian bawah (contoh: "Form Responses 1", "Sheet1", dll)
   - Update range jika perlu:
   ```env
   GOOGLE_SHEETS_RANGE=Sheet1!A:Z
   ```

### Step 4: Save File
1. Save file `.env`
2. Close editor

---

## Part 5: Verify Setup

### Step 1: Run Test Script
```bash
cd C:\Users\MTCL10DODIK\ohe-maintenance
node test-google-setup.js
```

### Step 2: Check Output
Anda akan melihat:
```
🧪 Testing Google Sheets Setup...

1️⃣  Checking credentials file...
✅ Credentials file found and valid
   Project ID: your-project-id
   Client Email: ohe-maintenance-sync@your-project.iam.gserviceaccount.com

2️⃣  Checking .env file...
✅ GOOGLE_SHEETS_SPREADSHEET_ID configured
   Spreadsheet ID: 1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
✅ GOOGLE_SHEETS_RANGE configured
   Range: Form Responses 1!A:Z

3️⃣  Testing Google Sheets API connection...
✅ Successfully connected to Google Sheets
   Found X rows (including header)
   Columns: Timestamp, Email, Nama, Jenis Pekerjaan, ...

✅ All tests passed!
```

### Step 3: Troubleshooting

#### Error: "Credentials file not found"
- Pastikan file `google-credentials.json` ada di `backend/config/`
- Check nama file (case-sensitive)

#### Error: "Invalid JSON"
- File credentials corrupt atau format salah
- Download ulang dari Google Cloud Console

#### Error: "Permission denied"
- Share Google Sheets dengan service account email
- Role harus: **Editor**

#### Error: "Spreadsheet not found"
- Check spreadsheet ID di `.env`
- Pastikan ID benar (dari URL)
- Jangan ada spasi

---

## Part 6: Restart Backend

### Step 1: Stop Backend
Jika backend sedang running, tekan `Ctrl+C` di terminal

### Step 2: Start Backend Again
```bash
cd C:\Users\MTCL10DODIK\ohe-maintenance\backend
npm run dev
```

### Step 3: Check Logs
Anda akan melihat:
```
✅ Google Sheets API initialized successfully
🔄 Google Sheets auto-sync enabled
```

Jika muncul:
```
⚠️  Google Sheets not configured. Auto-sync disabled.
```
Berarti ada masalah dengan `.env` atau credentials.

---

## ✅ Checklist

- [ ] Download credentials JSON dari Google Cloud
- [ ] Copy ke `backend/config/google-credentials.json`
- [ ] Rename jadi `google-credentials.json`
- [ ] Find spreadsheet ID dari Google Sheets URL
- [ ] Share Google Sheets dengan service account email (role: Editor)
- [ ] Update `GOOGLE_SHEETS_SPREADSHEET_ID` di `.env`
- [ ] Run `node test-google-setup.js` - semua tests pass
- [ ] Restart backend
- [ ] Check logs: "Google Sheets auto-sync enabled"

---

## 🎯 Next Steps

Setelah semua setup selesai:

1. **Test Manual Sync**:
   - Buka http://localhost:3000
   - Login sebagai ADMIN
   - Navigate ke "Input OHE"
   - Click "Sync from Google Sheets"
   - Check apakah data muncul

2. **Verify Auto-sync**:
   - Tunggu 5 menit
   - Check sync status indicator
   - Data harus auto-update

3. **Submit Test Form**:
   - Submit form di Google Forms
   - Tunggu 5 menit untuk auto-sync
   - Check data muncul di aplikasi

---

**Need Help?**

Check:
- `GOOGLE_SETUP_GUIDE.md` - Detailed guide
- `GOOGLE_INTEGRATION_SUMMARY.md` - Implementation summary
- Backend logs di terminal
- Browser console untuk errors

🚀 **Good luck!**
