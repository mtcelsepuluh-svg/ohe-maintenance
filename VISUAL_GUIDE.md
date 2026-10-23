# 🎨 Visual Guide - Work Time Sheet

## Apa yang Akan Anda Lihat

### 1. Login Page
```
┌─────────────────────────────────────────┐
│                                         │
│         OHE Maintenance                 │
│   Overall Human Efficiency Tracking     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  User ID                        │   │
│  │  ┌───────────────────────────┐  │   │
│  │  │ ADMIN001                  │  │   │
│  │  └───────────────────────────┘  │   │
│  │                                 │   │
│  │  PIN                            │   │
│  │  ┌───────────────────────────┐  │   │
│  │  │ admin123                  │  │   │
│  │  └───────────────────────────┘  │   │
│  │                                 │   │
│  │  ┌───────────────────────────┐  │   │
│  │  │       Login               │  │   │
│  │  └───────────────────────────┘  │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### 2. Navbar (Setelah Login)
```
┌─────────────────────────────────────────────────────────┐
│ ⚙️ OHE Maintenance                                      │
│                                                         │
│  Dashboard  Activities  Input OHE  Work Time  Reports   │
│                                                         │
│                              👤 Administrator (ADMIN)  │
│                              [Logout]                   │
└─────────────────────────────────────────────────────────┘
```

### 3. Work Time Sheet Page
```
┌─────────────────────────────────────────────────────────────────┐
│ Work Time Sheet                                                 │
│                                          [📊 Export Excel]     │
│                                          [+ Create Sheets]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Month: [December ▼]    Year: [2026 ▼]                         │
│                                                                 │
│  Legend: 🟢 Normal Day  🟡 Half Day  🔵 Overtime  🔴 Absence   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Summary Cards                                                   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│ │Total     │ │Total     │ │Total     │ │Avg per   │          │
│ │Personel  │ │Work Hours│ │Overtime  │ │Personel  │          │
│ │          │ │          │ │          │ │          │          │
│ │   11     │ │  2,270h  │ │   7h 30m │ │  206h    │          │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
├─────────────────────────────────────────────────────────────────┤
│ December 2026                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌────────────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬────┐ │
│ │ Personel   │ 1   │ 2   │ 3   │ 4   │ 5   │ 6   │ 7   │... │ │
│ │            │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │ Mon │    │ │
│ ├────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼────┤ │
│ │Supriyanto  │🟢   │🔵   │🟢   │🟢   │🔵   │🟢   │🟢   │    │ │
│ │            │420/0│420/ │420/0│420/0│390/ │420/0│420/0│    │ │
│ │            │     │180  │     │     │120  │     │     │    │ │
│ ├────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼────┤ │
│ │Sudarto     │🟢   │🟢   │🟢   │🟢   │🟢   │🟢   │🔴   │    │ │
│ │            │420/0│420/0│420/0│420/0│390/0│420/0│ 0/0 │    │ │
│ │            │     │     │     │     │     │     │ S   │    │ │
│ ├────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼────┤ │
│ │Adi Wibowo  │🟢   │🟢   │🔵   │🟢   │🟢   │🟢   │🟢   │    │ │
│ │            │420/0│420/0│420/ │420/0│390/0│420/0│420/0│    │ │
│ │            │     │     │150  │     │     │     │     │    │ │
│ ├────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼────┤ │
│ │...         │     │     │     │     │     │     │     │    │ │
│ ├────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼────┤ │
│ │Total/Day   │4620 │4620 │4770 │4620 │4290 │4620 │3780 │    │ │
│ └────────────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴────┘ │
│                                                                 │
│ Scroll horizontal untuk lihat tanggal 8-31 →                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Cell Detail (Ketika Click Cell)
```
┌─────────────────────────────────────┐
│ 🟢 Day 2 (Wed)                      │
│                                     │
│      420 / 180                      │
│      Total: 600 min                 │
│                                     │
│  [+OT]  [Abs]                       │
└─────────────────────────────────────┘

Keterangan:
- 420 = Standard time (minutes)
- 180 = Overtime (minutes)
- Total = 600 minutes (10 jam)
- [+OT] = Tombol untuk add overtime
- [Abs] = Tombol untuk mark absence
```

### 5. Overtime Modal
```
┌─────────────────────────────────────┐
│ Add Overtime                    [X] │
├─────────────────────────────────────┤
│                                     │
│ Adding overtime for Supriyanto      │
│ on date 2                           │
│                                     │
│ Overtime (minutes)                  │
│ ┌─────────────────────────────┐    │
│ │ 180                         │    │
│ └─────────────────────────────┘    │
│ Enter the number of overtime       │
│ minutes (e.g., 60 for 1 hour)      │
│                                     │
│ ┌─────────────────────────────┐    │
│ │ Quick conversions:          │    │
│ │ 30 min = 0.5 hour           │    │
│ │ 60 min = 1 hour             │    │
│ │ 90 min = 1.5 hours          │    │
│ │ 120 min = 2 hours           │    │
│ └─────────────────────────────┘    │
│                                     │
│              [Cancel] [Submit]      │
└─────────────────────────────────────┘
```

### 6. Absence Modal
```
┌─────────────────────────────────────┐
│ Mark Absence                    [X] │
├─────────────────────────────────────┤
│                                     │
│ Marking absence for Sudarto         │
│ on date 7                           │
│                                     │
│ Absence Type                        │
│ ┌─────────────────────────────┐    │
│ │ Sakit           ▼           │    │
│ │  - Sakit                    │    │
│ │  - Ijin                     │    │
│ │  - Cuti                     │    │
│ │  - Lain-lain                │    │
│ └─────────────────────────────┘    │
│                                     │
│ Remarks (Optional)                  │
│ ┌─────────────────────────────┐    │
│ │ Demam tinggi                │    │
│ └─────────────────────────────┘    │
│                                     │
│              [Cancel] [Submit]      │
└─────────────────────────────────────┘
```

### 7. Color Coding

#### 🟢 Green Cell (Normal Day)
```
┌────────────────────┐
│ Wed                │
│                    │
│    420 / 0         │
│    Total: 420 min  │
│                    │
│ [+OT]  [Abs]       │
└────────────────────┘
```

#### 🟡 Yellow Cell (Saturday - Half Day)
```
┌────────────────────┐
│ Sat                │
│                    │
│    390 / 0         │
│    Total: 390 min  │
│                    │
│ [+OT]  [Abs]       │
└────────────────────┘
```

#### 🔵 Blue Cell (Overtime)
```
┌────────────────────┐
│ Tue                │
│                    │
│    420 / 180       │
│    Total: 600 min  │
│                    │
│ [+OT]  [Abs]       │
└────────────────────┘
```

#### 🔴 Red Cell (Absence)
```
┌────────────────────┐
│ Mon        [S]     │
│                    │
│      ABSENT        │
│    Total: 0 min    │
│                    │
└────────────────────┘
```

### 8. Summary Row (Total per Hari)
```
┌────────────┬─────────┬─────────┬─────────┐
│ Total/Day  │  1-Dec  │  2-Dec  │  3-Dec  │
├────────────┼─────────┼─────────┼─────────┤
│            │  4620   │  4800   │  4770   │
│            │         │  +180   │  +150   │
└────────────┴─────────┴─────────┴─────────┘
```

### 9. Total Column (Total per Personel)
```
┌────────────┬──────────────────┐
│ Personel   │     Total        │
├────────────┼──────────────────┤
│Supriyanto  │  12,720 (212h)   │
│Sudarto     │  11,580 (193h)   │
│Adi Wibowo  │  12,570 (209h)   │
└────────────┴──────────────────┘
```

## 🎯 Interaksi

### Click Cell
- Click pada cell untuk lihat detail
- Modal akan muncul dengan opsi

### Add Overtime
1. Click cell pada hari kerja
2. Klik tombol "+OT"
3. Input overtime minutes
4. Klik "Submit"
5. Cell berubah jadi biru

### Mark Absence
1. Click cell pada hari kerja
2. Klik tombol "Abs"
3. Pilih absence type
4. Add remarks (optional)
5. Klik "Submit"
6. Cell berubah jadi merah

### Export
1. Klik tombol "📊 Export Excel"
2. File Excel ter-download
3. Buka file untuk lihat data

## 📱 Responsive

- Desktop: Full spreadsheet grid
- Tablet: Horizontal scroll
- Mobile: Vertical dan horizontal scroll

## 🎨 Design Features

- **Sticky Column**: Nama personel tetap terlihat saat scroll horizontal
- **Sticky Header**: Tanggal tetap terlihat saat scroll vertical
- **Hover Effect**: Cell membesar sedikit saat di-hover
- **Smooth Animations**: Transisi halus untuk semua interaksi
- **Color Coding**: Visual indicator untuk status
- **Badge**: Indicator untuk absence type (S/I/C/L)

---

**Ready to explore!** 🚀

Buka http://localhost:3000 dan lihat sendiri!
