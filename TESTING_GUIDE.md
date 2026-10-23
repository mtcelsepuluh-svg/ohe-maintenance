# 🧪 Testing Guide - Work Time Tracking Feature

## Cara Testing Manual

### 1. Akses Aplikasi
1. Buka browser: http://localhost:3000
2. Login dengan:
   - User ID: `ADMIN001`
   - PIN: `admin123`

### 2. Navigate ke Work Time
1. Setelah login, klik menu **"Work Time"** di navbar
2. Anda akan melihat halaman Work Time Sheet

### 3. Create Work Time Sheets
1. Pilih **Month**: December
2. Pilih **Year**: 2026
3. Klik tombol **"+ Create Sheets"**
4. Confirm dialog
5. Sistem akan generate work time sheets untuk semua personel

### 4. Lihat Work Time Sheet
1. Setelah create, Anda akan melihat spreadsheet grid
2. Setiap row adalah personel
3. Setiap kolom adalah tanggal (1-31)
4. Color coding:
   - **Hijau**: Normal working day
   - **Kuning**: Half day (Saturday)
   - **Biru**: Ada overtime
   - **Merah**: Absence

### 5. Test Add Overtime
1. Click cell pada hari kerja (misal tanggal 2)
2. Klik tombol **"+OT"**
3. Input overtime minutes (misal: 180)
4. Klik **"Submit"**
5. Cell akan berubah jadi biru
6. Total time akan update

### 6. Test Mark Absence
1. Click cell pada hari kerja (misal tanggal 7)
2. Klik tombol **"Abs"**
3. Pilih absence type: "Sakit"
4. Tambahkan remarks: "Test absence"
5. Klik **"Submit"**
6. Cell akan berubah jadi merah dengan badge "S"
7. Total time akan jadi 0

### 7. Test Export
1. Klik tombol **"📊 Export Excel"**
2. File Excel akan ter-download
3. Buka file Excel untuk melihat data

### 8. Verify Calculations
1. Lihat summary cards di atas:
   - Total Personel
   - Total Work Hours
   - Total Overtime
   - Avg per Personel
2. Lihat summary row di bawah:
   - Total per hari
3. Lihat total column di kanan:
   - Total per personel

## Expected Results

### Standard Hours
- Senin-Jumat: 420 min
- Sabtu: 390 min (half day)
- Minggu: 300 min

### Color Coding
- Green cell: Normal day (420/0)
- Yellow cell: Saturday (390/0)
- Blue cell: Overtime (420/180)
- Red cell: Absence (0/0)

### Summary Cards
- Total Personel: Jumlah mekanik aktif
- Total Work Hours: Total semua work hours
- Total Overtime: Total semua overtime
- Avg per Personel: Rata-rata per personel

## Troubleshooting

### Work time sheets tidak muncul
- Klik "Create Sheets" untuk generate
- Check console browser untuk error

### Cannot add overtime
- Pastikan day tersebut bukan absence day
- Check console browser untuk error

### Export gagal
- Check koneksi ke backend
- Check console browser untuk error

## API Testing (Optional)

Jika ingin test API langsung, bisa gunakan Postman atau curl:

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"ADMIN001\",\"pin\":\"admin123\"}"
```

### Get Work Time Sheets
```bash
curl -X GET http://localhost:5000/api/worktime/2026/12 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Bulk Sheets
```bash
curl -X POST http://localhost:5000/api/worktime/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"month\":12,\"year\":2026}"
```

### Add Overtime
```bash
curl -X POST http://localhost:5000/api/worktime/SHEET_ID/overtime \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"date\":2,\"overtime_minutes\":180,\"is_manual\":true}"
```

### Mark Absence
```bash
curl -X POST http://localhost:5000/api/worktime/SHEET_ID/absence \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"date\":7,\"absence_type\":\"sakit\",\"remarks\":\"Test\"}"
```

## Success Criteria

✅ Bisa login dan navigate ke Work Time
✅ Bisa create work time sheets
✅ Bisa lihat spreadsheet grid
✅ Bisa add overtime
✅ Bisa mark absence
✅ Bisa export ke Excel
✅ Calculations benar
✅ Color coding sesuai
✅ Responsive di mobile

---

**Happy Testing!** 🎉
