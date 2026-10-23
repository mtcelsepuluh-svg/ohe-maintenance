# Work Time Tracking Feature - Documentation

## 📋 Overview

Fitur Work Time Tracking memungkinkan Anda untuk:
- Monitor daily work hours untuk setiap personel
- Track overtime (lembur)
- Track absence (sakit, ijin, cuti)
- Export data ke Excel
- View summary dan analytics

## 🎯 Fitur Utama

### 1. Work Time Sheet (Spreadsheet Grid)
- View bulanan (31 hari) untuk semua personel
- Kolom: Tanggal (1-31), Standard Time, Overtime, Total
- Row: Per personel dengan nama dan nomor
- Saturday (Half Day) detection otomatis
- Total per hari dan total per bulan

### 2. Overtime Management
- **Manual Input**: User input langsung overtime minutes
- **Auto-calculate**: Calculate dari actual work time - standard time
- Toggle antara manual/auto mode
- Quick conversion reference (30 min = 0.5 hour, dll)

### 3. Absence Tracking
- **Sakit (S)**: Mekanik tidak masuk karena sakit
- **Ijin (I)**: Mekanik ijin pribadi
- **Cuti (C)**: Mekanik cuti tahunan
- **Lain-lain (L)**: Alasan lain dengan remarks
- Visual indicator untuk absence (red badge)

### 4. Export
- Export ke Excel (.xlsx)
- Format yang sama dengan spreadsheet view
- Include summary row dan column

## 🚀 Cara Menggunakan

### Akses Work Time Sheet
1. Login ke aplikasi
2. Klik menu **"Work Time"** di navbar
3. Pilih month dan year
4. Klik **"Create Sheets"** untuk generate work time sheets

### Create Work Time Sheets
1. Pilih month dan year yang diinginkan
2. Klik tombol **"+ Create Sheets"**
3. Sistem akan otomatis generate work time sheets untuk semua personel
4. Standard hours akan di-set otomatis:
   - Senin-Jumat: 420 min (7 jam)
   - Sabtu: 390 min (6.5 jam) - Half day
   - Minggu: 300 min (5 jam)

### Add Overtime
1. Click cell pada hari yang ingin ditambah overtime
2. Klik tombol **"+OT"**
3. Input overtime minutes
4. Klik **"Submit"**
5. Total time akan auto-update

### Mark Absence
1. Click cell pada hari yang ingin di-mark absence
2. Klik tombol **"Abs"**
3. Pilih absence type (Sakit/Ijin/Cuti/Lain-lain)
4. Tambahkan remarks (optional)
5. Klik **"Submit"**
6. Standard time akan di-set ke 0

### Edit Daily Entry
1. Click cell yang ingin di-edit
2. Modal akan muncul dengan opsi:
   - Add overtime
   - Mark absence
   - Edit remarks
3. Submit perubahan

### Export to Excel
1. Pilih month dan year
2. Klik tombol **"📊 Export Excel"**
3. File Excel akan ter-download dengan format yang sama

## 📊 Standard Hours Logic

Sistem otomatis mendeteksi day of week dan set standard hours:

| Day | Standard Hours | Notes |
|-----|---------------|-------|
| Monday-Friday | 420 min (7 jam) | Normal working day |
| Saturday | 390 min (6.5 jam) | Half day |
| Sunday | 300 min (5 jam) | Optional |

## 🎨 Color Coding

- **Green**: Normal working day
- **Yellow**: Half day (Saturday)
- **Blue**: Overtime (ada overtime)
- **Red**: Absence (sakit/ijin/cuti)

## 📱 UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Work Time Sheet - December 2026                            │
├─────────────────────────────────────────────────────────────┤
│ [Month ▼] [Year ▼]  [Export Excel]  [+ New Sheet]          │
├─────────────────────────────────────────────────────────────┤
│ Personel    │ 1-Dec  │ 2-Dec  │ 3-Dec  │ ... │ 31-Dec │ Total│
│             │ Std/OT │ Std/OT │ Std/OT │     │ Std/OT │      │
├─────────────┼────────┼────────┼────────┼─────┼────────┼──────┤
│ ① Supriyanto│ 420/0  │ 420/180│ 420/0  │     │ 390/0  │11880 │
│ ② Sudarto   │ 420/0  │ 420/180│ 420/0  │     │ 390/0  │12060 │
│ ...         │        │        │        │     │        │      │
├─────────────┼────────┼────────┼────────┼─────┼────────┼──────┤
│ Total/Day   │360/4560│720/4920│900/5100│     │ 0/4200 │84840 │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 API Endpoints

### Get Work Time Sheets
```http
GET /api/worktime/:year/:month?personel_id=xxx
Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 11,
  "data": [...],
  "summary": {...}
}
```

### Create Work Time Sheet
```http
POST /api/worktime
Authorization: Bearer <token>
Content-Type: application/json

{
  "personel_id": "xxx",
  "month": 12,
  "year": 2026
}
```

### Create Bulk Work Time Sheets
```http
POST /api/worktime/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "month": 12,
  "year": 2026
}
```

### Add Overtime
```http
POST /api/worktime/:id/overtime
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": 1,
  "overtime_minutes": 180,
  "is_manual": true
}
```

### Mark Absence
```http
POST /api/worktime/:id/absence
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": 1,
  "absence_type": "sakit",
  "remarks": "Demam tinggi"
}
```

### Update Daily Entry
```http
PUT /api/worktime/:id/day/:date
Authorization: Bearer <token>
Content-Type: application/json

{
  "overtime": 120,
  "remarks": "Updated"
}
```

### Export to Excel
```http
GET /api/worktime/:year/:month/export
Authorization: Bearer <token>
```

## 📝 Database Schema

### WorkTimeSheet Model
```javascript
{
  personel_id: ObjectId (ref: User),
  personel_name: String,
  month: Number (1-12),
  year: Number,
  daily_entries: [{
    date: Number (1-31),
    day_of_week: String (Mon, Tue, Wed, Thu, Fri, Sat, Sun),
    is_half_day: Boolean,
    standard_time: Number (minutes),
    overtime: Number (minutes),
    total_time: Number (minutes),
    status: String (present/absence/holiday/leave),
    absence_type: String (sakit/ijin/cuti/lain-lain),
    remarks: String,
    is_manual_overtime: Boolean
  }],
  total_monthly: Number (minutes),
  created_by: String,
  created_at: Date,
  updated_at: Date
}
```

## 💡 Tips & Tricks

### Quick Overtime Entry
- Gunakan tombol "+OT" untuk quick entry
- Input dalam minutes (60 = 1 jam, 120 = 2 jam)
- Sistem akan auto-calculate total time

### Bulk Absence Marking
- Untuk mark multiple days, repeat proses untuk setiap day
- Gunakan remarks untuk detail tambahan

### Export Tips
- Export sebelum deadline untuk backup data
- Format Excel sudah sesuai dengan standar reporting
- Bisa di-import kembali ke sistem (future feature)

### Navigation
- Gunakan horizontal scroll untuk navigate tanggal
- Sticky column pertama untuk lihat nama personel
- Summary row di bawah untuk lihat total per hari

## 🔒 Permissions

- **ADMIN**: Can create, edit, delete all work time sheets
- **MEKANIK**: Can view and edit own work time sheets

## 📊 Calculations

### Total Time per Day
```
Total Time = Standard Time + Overtime
```

### Total Monthly
```
Total Monthly = Sum of all daily total times
```

### Efficiency (Future)
```
Efficiency = (Total Productive Time / Total Work Time) × 100%
```

## 🐛 Troubleshooting

### Work time sheets tidak muncul
- Pastikan sudah klik "Create Sheets" untuk generate sheets
- Check month dan year yang dipilih
- Check console untuk error messages

### Cannot add overtime
- Pastikan day tersebut bukan absence day
- Check apakah user memiliki permission
- Check console untuk error messages

### Export gagal
- Check koneksi internet
- Check apakah ada data untuk month/year yang dipilih
- Check browser console untuk error messages

## 🚀 Future Enhancements

1. **Import from Excel** - Upload Excel file untuk bulk update
2. **Approval Workflow** - Overtime perlu approval dari supervisor
3. **Notifications** - Alert untuk excessive overtime
4. **Payroll Integration** - Connect dengan payroll system
5. **Historical Analysis** - Trend analysis dan reporting
6. **Mobile App** - React Native version untuk mobile access

---

**Version**: 1.0.0  
**Last Updated**: 23 Oktober 2026  
**Status**: ✅ Production Ready
