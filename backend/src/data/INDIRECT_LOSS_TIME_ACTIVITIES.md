# Indirect & Loss Time Activities - Data Lengkap

## 📊 Ringkasan Data

### Indirect Time Activities
**Total**: 8 activities

### Loss Time Activities
**Total**: 4 activities

---

## 🔄 INDIRECT TIME (8 Activities)

Indirect Time adalah aktivitas pendukung produksi tetapi tidak memberi value langsung.

| Code | Activity Name | Standard Time (min) | Description |
|------|---------------|---------------------|-------------|
| IND-001 | Briefing MTC | 15 | Briefing pagi untuk tim MTC |
| IND-002 | Briefing All divisi | 30 | Briefing bersama seluruh divisi |
| IND-003 | Work Preparation / Persiapan Alat | 20 | Persiapan alat dan material sebelum kerja |
| IND-004 | Work Completion / Pembuatan laporan | 15 | Pembuatan laporan pekerjaan dan dokumentasi |
| IND-005 | Fisiotheraphy | 10 | Istirahat dan pemulihan fisik |
| IND-006 | 5R | 15 | Ringkas, Rapi, Resik, Rawat, Rajin (5S/5R) |
| IND-007 | Meeting / Training | 60 | Meeting atau training kerja |
| IND-008 | Toilet | 10 | Istirahat ke toilet |

### Statistik Indirect Time
- **Min**: 10 menit
- **Max**: 60 menit (Meeting/Training)
- **Average**: 21.25 menit
- **Total**: 175 menit

### Kategori Indirect Time

1. **Briefing & Komunikasi** (2 activities)
   - Briefing MTC
   - Briefing All divisi

2. **Work Preparation & Completion** (2 activities)
   - Work Preparation / Persiapan Alat
   - Work Completion / Pembuatan laporan

3. **Istirahat & Kesehatan** (2 activities)
   - Fisiotheraphy
   - Toilet

4. **Administrasi & Training** (1 activity)
   - Meeting / Training

5. **5R/5S** (1 activity)
   - 5R (Ringkas, Rapi, Resik, Rawat, Rajin)

---

## ⚠️ LOSS TIME (4 Activities)

Loss Time adalah aktivitas yang dianggap kehilangan waktu dan tidak produktif.

| Code | Activity Name | Standard Time (min) | Description |
|------|---------------|---------------------|-------------|
| LOSS-001 | Menunggu spare part | 0 | Waktu tunggu karena spare part tidak tersedia |
| LOSS-002 | Menunggu mesin tanpa ada kegiatan lain | 0 | Idle time karena mesin dalam proses perbaikan |
| LOSS-003 | Response perbaikan lebih dari 15 menit | 0 | Delay response time untuk perbaikan |
| LOSS-004 | Menunggu QC | 0 | Waktu tunggu untuk quality check |

### Statistik Loss Time
- **Standard Time**: 0 menit (semua activities)
- **Actual Time**: Variabel (tergantung kondisi)
- **Goal**: Meminimalkan semua Loss Time

### Kategori Loss Time

1. **Waiting Time** (3 activities)
   - Menunggu spare part
   - Menunggu mesin tanpa ada kegiatan lain
   - Menunggu QC

2. **Response Delay** (1 activity)
   - Response perbaikan lebih dari 15 menit

---

## 💾 Database Schema

### IndirectList Collection
```javascript
{
  _id: ObjectId,
  activity_code: String (unique),
  activity_name: String,
  category: "INDIRECT",
  standard_time: Number (dalam menit),
  unit: "minutes",
  description: String,
  status: "active" | "inactive",
  created_at: Date,
  updated_at: Date
}
```

### LossTimeList Collection
```javascript
{
  _id: ObjectId,
  activity_code: String (unique),
  activity_name: String,
  category: "LOSS",
  standard_time: Number (default: 0),
  unit: "minutes",
  description: String,
  status: "active" | "inactive",
  created_at: Date,
  updated_at: Date
}
```

---

## 🔍 Cara Menggunakan

### 1. Query semua Indirect Time activities
```javascript
const indirectActivities = await IndirectList.find({ status: 'active' });
```

### 2. Query semua Loss Time activities
```javascript
const lossActivities = await LossTimeList.find({ status: 'active' });
```

### 3. Query activity tertentu
```javascript
const briefing = await IndirectList.findOne({ 
  activity_code: 'IND-001' 
});

const waitingSparePart = await LossTimeList.findOne({ 
  activity_code: 'LOSS-001' 
});
```

### 4. Search by name
```javascript
const results = await IndirectList.find({
  activity_name: { $regex: 'briefing', $options: 'i' }
});
```

---

## 📈 Perhitungan OHE dengan Indirect & Loss Time

### Formula OHE
```
Total Work Time = Value Time + Direct Time + Indirect Time + Loss Time

Efficiency = (Value Time / Total Work Time) × 100%

OHE = (Value Time / Total Work Time) × 100%

Direct Ratio = (Direct Time / Total Work Time) × 100%
```

### Contoh Perhitungan

Jika dalam 1 shift (420 menit):
- Value Time: 200 menit
- Direct Time: 100 menit
- Indirect Time: 80 menit
- Loss Time: 40 menit

Maka:
```
Total Work Time = 200 + 100 + 80 + 40 = 420 menit

Efficiency = (200 / 420) × 100% = 47.62%

OHE = (200 / 420) × 100% = 47.62%

Direct Ratio = (100 / 420) × 100% = 23.81%
```

### Target OHE
- **Target**: 85%
- **Benchmark**: 90%

### Status
- **ACHIEVED**: OHE >= 90% (benchmark)
- **WARNING**: OHE >= 85% (target)
- **NOT ACHIEVED**: OHE < 85%

---

## 🎯 Strategi Improvements

### Untuk Mengurangi Indirect Time:
1. **Efisienkan Briefing**
   - Buat briefing lebih singkat dan fokus
   - Gunakan visual aid

2. **Optimasi Work Preparation**
   - Siapkan alat sebelumnya
   - Buat checklist standar

3. **Kurangi Meeting**
   - Meeting hanya jika perlu
   - Set time limit

### Untuk Mengurangi Loss Time:
1. **Menunggu Spare Part**
   - Improve inventory management
   - Stock buffer untuk spare part critical
   - Vendor management

2. **Menunggu Mesin**
   - Parallel tasks
   - Cross-training mekanik
   - Better scheduling

3. **Response Delay**
   - Improve response time SOP
   - Priority system
   - On-call mekanik

4. **Menunggu QC**
   - Inline QC
   - Faster QC process
   - Better communication

---

## 📊 Analisis Data

### Distribusi Indirect Time
```
Briefing: 45 menit (25.7%)
Work Prep/Completion: 35 menit (20%)
Istirahat: 20 menit (11.4%)
Meeting/Training: 60 menit (34.3%)
5R: 15 menit (8.6%)
```

### Impact pada OHE
Jika Indirect Time bisa dikurangi 20%:
- Current Indirect: 80 menit
- Reduced Indirect: 64 menit
- Saved: 16 menit
- Bisa digunakan untuk Value Time
- Impact: OHE meningkat ~4%

---

## 🔄 Update Data

Untuk menambah/mengubah data Indirect atau Loss Time:

1. Edit file:
   - `backend/src/data/indirectTimeActivities.js`
   - `backend/src/data/lossTimeActivities.js`

2. Jalankan ulang: `npm run init-db`

3. Data yang sudah ada tidak akan dihapus (aman dijalankan berulang)

---

## 📝 Catatan Penting

1. **Indirect Time** memiliki standard time yang fixed
2. **Loss Time** memiliki standard time = 0 (harus diminimalkan)
3. Mekanik harus memilih activity_code yang sesuai saat input OHE
4. Sistem akan menghitung otomatis Total Work Time
5. Loss Time harus diminimalkan untuk meningkatkan OHE

---

## 📚 Referensi

- **Value Time**: Lihat `VALUE_TIME_ACTIVITIES.md`
- **Direct Time**: Menggunakan sample data (4 activities)
- **OHE Calculator**: `backend/src/utils/OHECalculator.js`

---

**Last Updated**: 22 Oktober 2026  
**Total Activities**: 
- Value Time: 70
- Direct Time: 4 (sample)
- Indirect Time: 8
- Loss Time: 4
- **Grand Total: 86 activities**

**Status**: ✅ Siap digunakan
