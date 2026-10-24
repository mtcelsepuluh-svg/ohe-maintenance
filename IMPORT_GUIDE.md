# 📊 Panduan Import Activities

## ✅ Status Import

Fitur import activities telah berhasil diupdate dan ditest:
- ✅ Format baru: Hanya menggunakan **Durasi (dalam menit)**
- ✅ Field `Jam Mulai` dan `Jam Selesai`: **Tidak wajib lagi**
- ✅ Data import tersimpan dengan benar di database

## 📋 Format Excel Import

### Kolom WAJIB:
1. **Nama** - Nama pekerja (contoh: ADMIN001)
2. **Jenis Pekerjaan** - Jenis pekerjaan yang dilakukan
3. **Tanggal** - Tanggal pekerjaan (format: YYYY-MM-DD atau date Excel)
4. **Durasi ( dlm menit )** atau **Durasi (dalam menit)** - Durasi pekerjaan dalam menit

### Kolom OPTIONAL:
- **Kategori Pekerjaan** - Corective/Preventive/Proyek/Indirect (default: Preventive)
- **Pekerjaan Indirect** - Jenis pekerjaan indirect (jika kategori = Indirect)
- **Durasi waktu Indirect** - Durasi indirect dalam menit
- **Loss Time** - Jenis loss time
- **Durasi waktu Loss Time** - Durasi loss time dalam menit

### Contoh Data Import:

| Nama | Jenis Pekerjaan | Tanggal | Durasi ( dlm menit ) | Kategori Pekerjaan |
|------|-----------------|---------|---------------------|-------------------|
| ADMIN001 | Servicing Motor OHE | 2026-01-15 | 45 | Preventive |
| ADMIN001 | Perbaikan Pantograph | 2026-01-16 | 120 | Corective |
| ADMIN001 | Installasi Equipment Baru | 2026-01-17 | 180 | Proyek |
| ADMIN001 | Meeting Planning | 2026-01-18 | 60 | Indirect |

## 🔍 Perbedaan Activities vs OHE Input

### Activities Page (`/activities`)
- **Endpoint API**: `/api/valuetimes`, `/api/directs`, `/api/indirects`, `/api/losstimes`
- **Model Database**: `ValueTimeList`, `DirectList`, `IndirectList`, `LossTimeList`
- **Fungsi**: Menampilkan **master data activities** (daftar jenis pekerjaan yang tersedia)
- **Analogi**: "Daftar menu di restoran"

### OHE Input Page (`/input-ohe`)
- **Endpoint API**: `/api/oheinputs`
- **Model Database**: `OHEInput`
- **Fungsi**: Menampilkan **data hasil import/input** (pekerjaan yang sudah dilakukan)
- **Analogi**: "Order yang sudah dipesan"

## 📍 Cara Melihat Data Import

Data import yang sudah berhasil dapat dilihat di:

### 1. Input OHE Page
- **URL**: `http://localhost:3000/input-ohe`
- Menampilkan data OHE Input yang sudah di-import
- Dapat filter berdasarkan tanggal, nama, kategori

### 2. Dashboard
- **URL**: `http://localhost:3000/dashboard`
- Menampilkan ringkasan data OHE Input
- Statistik dan grafik pekerjaan

### 3. API Endpoint
```bash
# Get all OHE inputs
GET /api/oheinputs

# Get OHE inputs with date filter
GET /api/oheinputs?startDate=2026-01-01&endDate=2026-01-31

# Get OHE inputs with nama filter
GET /api/oheinputs?nama=ADMIN001
```

## 🧪 Test Files

File test yang telah dibuat:
1. `test-import-new-format.xlsx` - File Excel test dengan format baru
2. `generate-test-excel.js` - Script untuk generate file Excel
3. `test-import-api.js` - Script untuk test API import
4. `test-get-activities.js` - Script untuk test get activities API
5. `test-ohe-inputs.js` - Script untuk test OHE inputs API

## 📝 Hasil Test

### Import Test
```
✅ Total rows: 5
✅ Valid records: 5
✅ Created records: 5
✅ Errors: 0
```

### Data Tersimpan
```
✓ OHE-20261024-91591 | Servicing Motor OHE       | 15/1/2026 | 45 min
✓ OHE-20261024-91592 | Perbaikan Pantograph      | 16/1/2026 | 120 min
✓ OHE-20261024-91593 | Installasi Equipment Baru | 17/1/2026 | 180 min
✓ OHE-20261024-91594 | Meeting Planning          | 18/1/2026 | 60 min
✓ OHE-20261024-91595 | Inspeksi Rutin            | 19/1/2026 | 90 min
```

**Catatan:**
- Field `jam_mulai` dan `jam_selesai`: Tidak diisi (N/A)
- Field `actual_time_min`: Berisi durasi dari Excel

## 🔧 Perubahan Kode

### Backend Controller (`importController.js`)
- ❌ Dihapus: Validasi & parsing untuk `Jam Mulai` dan `Jam Selesai`
- ✅ Ditambah: Validasi wajib untuk `Durasi (dalam menit)`
- ✅ Simplified: Langsung pakai durasi dari Excel

### Database Model (`OHEInput.js`)
- ✅ `jam_mulai`: `required: false` (optional)
- ✅ `jam_selesai`: `required: false` (optional)

## 🚀 Cara Menggunakan

### 1. Siapkan File Excel
Buat file Excel dengan kolom:
- Nama
- Jenis Pekerjaan
- Tanggal
- Durasi ( dlm menit )
- Kategori Pekerjaan (optional)

### 2. Import via Frontend
1. Buka `http://localhost:3000/activities`
2. Klik tombol "Import"
3. Pilih file Excel
4. Upload

### 3. Lihat Hasil Import
1. Buka `http://localhost:3000/input-ohe`
2. Data import akan muncul di sini
3. Filter berdasarkan tanggal/nama/kategori

## ✅ Kesimpulan

- ✅ Import activities dengan format baru (hanya durasi) **BERHASIL**
- ✅ Data tersimpan dengan benar di database
- ✅ Field `jam_mulai` dan `jam_selesai` sudah tidak wajib
- ✅ Data import dapat dilihat di halaman **Input OHE** (`/input-ohe`)
- ✅ Data import **TIDAK akan muncul** di halaman **Activities** (`/activities`) karena Activities menampilkan master data, bukan data import

---

**Last Updated**: 2026-10-24
**Tested By**: Automated Test Script
