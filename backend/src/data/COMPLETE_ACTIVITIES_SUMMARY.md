# 📊 OHE MTC - Complete Activities Summary

## ✅ Status Data Activities

### Total: 86 Activities

| Category | Count | Status |
|----------|-------|--------|
| **Value Time** | 70 | ✅ Complete |
| **Direct Time** | 4 | ✅ Sample |
| **Indirect Time** | 8 | ✅ Complete |
| **Loss Time** | 4 | ✅ Complete |

---

## 🎯 Value Time Activities (70 items)

### 1. Corrective (53 activities)
Perbaikan dan maintenance mesin/equipment

**Sub-categories:**
- Perbaikan Setting & Mekanikal (16)
- Perbaikan Elektrik (18)
- Perbaikan Forklift (10)
- Perbaikan Kendaraan (5)
- Perbaikan Fasilitas & Utilitas (2)
- Perbaikan Alat & Equipment (2)

**Standard Time Range:** 30 - 240 menit

### 2. Preventive (3 activities)
Perawatan preventif mesin

- Inspeksi Harian (30 min)
- Preventive Maintenance (60 min)
- Taging Elektrik (45 min)

### 3. Pekerjaan Proyek MTC (17 activities)
Fabrication dan proyek khusus

**Standard Time Range:** 60 - 480 menit

**Examples:**
- Pembuatan Dies Baru (240 min)
- Pembuatan roll mesin (240 min)
- Membantu instalasi mesin baru (480 min)

📄 **Detail:** `VALUE_TIME_ACTIVITIES.md`

---

## 🔧 Direct Time Activities (4 items - Sample)

Aktivitas langsung terkait produksi

| Code | Activity | Time (min) |
|------|----------|------------|
| DIR-001 | Loading Material | 15 |
| DIR-002 | Machine Operation | 120 |
| DIR-003 | Quality Check | 10 |
| DIR-004 | Unloading Product | 10 |

**Total:** 155 menit

📝 **Note:** Data sample - bisa ditambah sesuai kebutuhan

---

## 🔄 Indirect Time Activities (8 items)

Aktivitas pendukung produksi

| Code | Activity | Time (min) |
|------|----------|------------|
| IND-001 | Briefing MTC | 15 |
| IND-002 | Briefing All divisi | 30 |
| IND-003 | Work Preparation / Persiapan Alat | 20 |
| IND-004 | Work Completion / Pembuatan laporan | 15 |
| IND-005 | Fisiotheraphy | 10 |
| IND-006 | 5R | 15 |
| IND-007 | Meeting / Training | 60 |
| IND-008 | Toilet | 10 |

**Total:** 175 menit  
**Average:** 21.25 menit

📄 **Detail:** `INDIRECT_LOSS_TIME_ACTIVITIES.md`

---

## ⚠️ Loss Time Activities (4 items)

Aktivitas kehilangan waktu (tidak produktif)

| Code | Activity | Standard Time |
|------|----------|---------------|
| LOSS-001 | Menunggu spare part | 0 (actual varies) |
| LOSS-002 | Menunggu mesin tanpa ada kegiatan lain | 0 (actual varies) |
| LOSS-003 | Response perbaikan lebih dari 15 menit | 0 (actual varies) |
| LOSS-004 | Menunggu QC | 0 (actual varies) |

**Goal:** Meminimalkan semua Loss Time

📄 **Detail:** `INDIRECT_LOSS_TIME_ACTIVITIES.md`

---

## 📈 Statistik Lengkap

### Distribusi Standard Time

| Category | Min | Max | Average | Total |
|----------|-----|-----|---------|-------|
| Value Time - Corrective | 30 | 240 | 57 | 3,021 |
| Value Time - Preventive | 30 | 60 | 45 | 135 |
| Value Time - Project | 60 | 480 | 189 | 3,213 |
| Direct Time | 10 | 120 | 38.75 | 155 |
| Indirect Time | 10 | 60 | 21.88 | 175 |
| Loss Time | 0 | 0 | 0 | 0 |

### Working Hours Reference

**Senin - Kamis:**
- Working: 07:30 - 15:00
- Break: 12:00 - 12:30
- **Effective: 420 menit**

**Jumat:**
- Working: 07:00 - 15:00
- Break: 11:45 - 12:45
- **Effective: 390 menit**

**Sabtu:**
- Working: 07:30 - 13:00
- Break: 11:30 - 12:00
- **Effective: 300 menit**

---

## 🧮 Rumus Perhitungan OHE

### 1. Total Work Time
```
Total Work Time = Value Time + Direct Time + Indirect Time + Loss Time
```

### 2. Efficiency
```
Efficiency = (Value Time / Total Work Time) × 100%
```

### 3. OHE (Overall Human Efficiency)
```
OHE = (Value Time / Total Work Time) × 100%
```

### 4. Direct Ratio
```
Direct Ratio = (Direct Time / Total Work Time) × 100%
```

### 5. Achievement
```
Achievement = (Actual OHE / Target OHE) × 100%
```

### 6. Status
```
If OHE >= Benchmark (90%) → ACHIEVED
If OHE >= Target (85%) → WARNING
If OHE < Target (85%) → NOT ACHIEVED
```

---

## 💾 Database Structure

### Collections

1. **users** - User management
2. **mekaniks** - Machine assignments
3. **valuetimelists** - 70 Value Time activities
4. **directlists** - Direct activities
5. **indirectlists** - 8 Indirect activities
6. **losstimelists** - 4 Loss activities
7. **standardtimes** - Standard time per machine
8. **oheinputs** - Daily transactions
9. **settings** - Application settings
10. **logs** - Audit trail

### Indexes
- activity_code (unique)
- category
- status
- date (for OHE inputs)

---

## 🚀 Cara Menggunakan

### 1. Initialize Database
```bash
cd ohe-maintenance/backend
npm run init-db
```

### 2. Query Activities

**Get all Value Time:**
```javascript
const valueTime = await ValueTimeList.find({ status: 'active' });
```

**Get by category:**
```javascript
const corrective = await ValueTimeList.find({ 
  sub_category: 'Corrective',
  status: 'active' 
});
```

**Get Indirect Time:**
```javascript
const indirect = await IndirectList.find({ status: 'active' });
```

**Get Loss Time:**
```javascript
const loss = await LossTimeList.find({ status: 'active' });
```

### 3. Input OHE
```javascript
const oheInput = await OHEInput.create({
  record_id: 'OHE-20261022-0001',
  date: new Date(),
  shift: '1',
  mekanik: 'John Doe',
  activity_code: 'VT-COR-001',
  activity_name: 'Perbaikan setting pisau',
  category: 'VALUE TIME',
  start_time: '08:00',
  end_time: '08:30',
  actual_time_min: 30,
  standard_time_min: 30,
  created_by: 'ADMIN001'
});
```

---

## 📊 Contoh Kasus

### Skenario 1: Shift Normal (420 menit)

**Aktivitas Mekanik:**
- Value Time: 
  - Perbaikan setting pisau (30 min)
  - Perbaikan Elektrik mesin Genteng (60 min)
  - Inspeksi Harian (30 min)
  - **Total: 120 min**

- Direct Time:
  - Loading Material (15 min)
  - Machine Operation (120 min)
  - **Total: 135 min**

- Indirect Time:
  - Briefing MTC (15 min)
  - Work Preparation (20 min)
  - Toilet (10 min)
  - **Total: 45 min**

- Loss Time:
  - Menunggu spare part (30 min)
  - **Total: 30 min**

**Perhitungan:**
```
Total Work Time = 120 + 135 + 45 + 30 = 330 menit
(dari 420 menit available)

Value Time = 120 menit
Direct Time = 135 menit
Indirect Time = 45 menit
Loss Time = 30 menit

Efficiency = (120 / 330) × 100% = 36.36%
OHE = (120 / 330) × 100% = 36.36%
Direct Ratio = (135 / 330) × 100% = 40.91%

Status: NOT ACHIEVED (Target: 85%)
```

### Analisis:
- OHE sangat rendah (36.36% vs Target 85%)
- Loss Time tinggi (30 menit menunggu spare part)
- Perlu improvement:
  - Reduce waiting time (spare part management)
  - Increase Value Time activities
  - Reduce Indirect Time

---

## 🎯 Improvement Targets

### Short Term (1 bulan)
- Reduce Loss Time by 50%
- Increase Value Time by 20%
- OHE target: 50%

### Medium Term (3 bulan)
- Reduce Loss Time by 75%
- Increase Value Time by 40%
- OHE target: 70%

### Long Term (6 bulan)
- Minimize Loss Time (< 5%)
- Optimize Indirect Time
- OHE target: 85% (achieve target)

---

## 📁 File Struktur

```
backend/
├── src/
│   ├── data/
│   │   ├── valueTimeActivities.js          ← 70 activities
│   │   ├── indirectTimeActivities.js       ← 8 activities
│   │   ├── lossTimeActivities.js           ← 4 activities
│   │   ├── VALUE_TIME_ACTIVITIES.md        ← Detail Value Time
│   │   └── INDIRECT_LOSS_TIME_ACTIVITIES.md ← Detail Indirect & Loss
│   ├── models/
│   │   ├── ValueTimeList.js
│   │   ├── IndirectList.js
│   │   ├── LossTimeList.js
│   │   └── ...
│   └── utils/
│       ├── OHECalculator.js                ← Perhitungan OHE
│       └── setupDatabase.js                ← Init database
```

---

## ✅ Checklist

### Database
- [x] Value Time activities (70)
- [x] Indirect Time activities (8)
- [x] Loss Time activities (4)
- [x] Direct Time activities (4 - sample)
- [x] Settings (19 items)
- [x] Admin user
- [x] Sample machines

### Documentation
- [x] VALUE_TIME_ACTIVITIES.md
- [x] INDIRECT_LOSS_TIME_ACTIVITIES.md
- [x] COMPLETE_ACTIVITIES_SUMMARY.md (this file)
- [x] OHE_MTC_STATUS.md
- [x] QUICK_START_OHE.md

### Code
- [x] Database models
- [x] OHE Calculator
- [x] Setup script
- [x] Data files

---

## 📞 Next Steps

### Immediate
1. ✅ Run `npm run init-db`
2. ✅ Verify all data imported
3. ⏳ Test OHE Calculator
4. ⏳ Build backend API endpoints

### Phase 2
- [ ] Auth API
- [ ] Activities CRUD API
- [ ] OHE Input API
- [ ] Dashboard API

### Phase 3
- [ ] Login page
- [ ] Dashboard UI
- [ ] Input forms
- [ ] Charts & graphs

---

**Last Updated**: 22 Oktober 2026  
**Total Activities**: 86  
**Database Status**: ✅ Ready  
**Next Phase**: Backend API Development

---

**OHE MTC - Overall Human Efficiency System**  
*Improving maintenance efficiency through data-driven insights*
