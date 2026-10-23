# 🚀 Quick Start - Work Time Tracking

## Langkah-langkah Testing

### 1. Buka Aplikasi
```
http://localhost:3000
```

### 2. Login
```
User ID: ADMIN001
PIN:     admin123
```

### 3. Klik Menu "Work Time"
Akan muncul halaman Work Time Sheet

### 4. Pilih Periode
- Month: **December**
- Year: **2026**

### 5. Create Sheets
Klik tombol **"+ Create Sheets"** di kanan atas

### 6. Lihat Results
- Spreadsheet grid akan muncul
- Setiap row = 1 personel
- Setiap kolom = 1 tanggal
- Summary cards di atas
- Total row di bawah

### 7. Test Fitur

#### Add Overtime
1. Click cell tanggal 2
2. Klik **"+OT"**
3. Input: **180** minutes
4. Submit
5. Cell jadi biru

#### Mark Absence
1. Click cell tanggal 7
2. Klik **"Abs"**
3. Pilih: **"Sakit"**
4. Remarks: **"Test"**
5. Submit
6. Cell jadi merah

#### Export
1. Klik **"📊 Export Excel"**
2. File ter-download
3. Buka file Excel

## Features to Test

✅ Create work time sheets
✅ View spreadsheet grid
✅ Add overtime
✅ Mark absence (Sakit/Ijin/Cuti)
✅ Export to Excel
✅ Summary calculations
✅ Color coding
✅ Responsive design

## Expected Behavior

### Standard Hours
- Mon-Fri: 420 min (7 jam)
- Saturday: 390 min (6.5 jam)
- Sunday: 300 min (5 jam)

### Colors
- 🟢 Green: Normal day
- 🟡 Yellow: Saturday (half day)
- 🔵 Blue: Overtime
- 🔴 Red: Absence

### Summary
- Total Personel: 11 (sesuai data Anda)
- Total Work Hours: ~12,000+ minutes
- Total Overtime: Variasi per day
- Avg per Personel: ~1,100 minutes

## Screenshots Guide

### Main View
```
┌─────────────────────────────────────────┐
│ Work Time Sheet                         │
├─────────────────────────────────────────┤
│ [Month ▼] [Year ▼]  [Export] [+ Create]│
├─────────────────────────────────────────┤
│ Summary Cards                           │
│ - Total Personel                        │
│ - Total Work Hours                      │
│ - Total Overtime                        │
│ - Avg per Personel                      │
├─────────────────────────────────────────┤
│ Spreadsheet Grid                        │
│ Personel │ 1 │ 2 │ 3 │ ... │ 31 │ Total│
│ ① Name   │420│420│420│     │390 │11880 │
│ ② Name   │420│420│420│     │390 │12060 │
│ ...                                     │
│ Total    │360│720│900│     │420 │84840 │
└─────────────────────────────────────────┘
```

## Need Help?

Check:
- `WORKTIME_DOCUMENTATION.md` - Full documentation
- `TESTING_GUIDE.md` - Detailed testing guide
- Browser console for errors
- Backend terminal for API logs

---

**Ready to test!** 🎉
