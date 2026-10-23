# Setup dan Running OHE Maintenance

## 📋 Prerequisites

Sebelum menjalankan aplikasi, pastikan sudah install:

1. **Node.js** (v18 atau lebih baru)
   - Download dari: https://nodejs.org/
   - Cek versi: `node --version`

2. **MongoDB** (v9.0.4 atau lebih baru)
   - Download dari: https://www.mongodb.com/try/download/community
   - MongoDB harus running sebagai service atau manual

## 🚀 Cara Menjalankan

### Opsi 1: Menggunakan Script (Recommended)

Double-click file `start.bat` atau jalankan:

```bash
start.bat
```

Script ini akan:
- Menjalankan backend di port 5000
- Menjalankan frontend di port 3000
- Membuka 2 command prompt windows

### Opsi 2: Manual

#### Step 1: Jalankan MongoDB

Jika MongoDB belum running sebagai service:

```bash
# Windows
net start MongoDB

# Atau jalankan manual
mongod --dbpath "C:\ProgramData\MongoDB\Server\9.0\data"
```

#### Step 2: Jalankan Backend

Buka terminal/command prompt:

```bash
cd ohe-maintenance\backend

# First time only: Initialize database
npm run init-db

# Jalankan server
npm run dev
```

Backend akan berjalan di: `http://localhost:5000`

#### Step 3: Jalankan Frontend

Buka terminal/command prompt baru:

```bash
cd ohe-maintenance\frontend

# Jalankan dev server
npm run dev
```

Frontend akan berjalan di: `http://localhost:3000`

## 🔐 Login Pertama Kali

1. Buka browser: `http://localhost:3000`
2. Login dengan:
   - User ID: `ADMIN001`
   - PIN: `admin123`

## 📝 Initial Setup

### Initialize Database (First Time Only)

```bash
cd backend
npm run init-db
```

Script ini akan:
- Membuat collections di MongoDB
- Insert default admin user
- Insert sample activities (Value Time, Direct, Indirect, Loss Time)
- Insert default settings

### Cek MongoDB Connection

Pastikan MongoDB running di `localhost:27017`:

```bash
# Cek MongoDB status
mongosh

# Di MongoDB shell, cek databases
show dbs

# Harus ada database 'ohe_maintenance'
```

## 🔧 Troubleshooting

### Backend tidak bisa connect ke MongoDB

**Error**: `MongoNetworkError: connect ECONNREFUSED`

**Solusi**:
1. Cek MongoDB service: `net start MongoDB`
2. Cek MongoDB running di port 27017
3. Cek file `.env` di backend, pastikan:
   ```
   MONGODB_URI=mongodb://localhost:27017/ohe_maintenance
   ```

### Port sudah digunakan

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solusi**:
1. Cek proses yang menggunakan port 5000:
   ```bash
   netstat -ano | findstr :5000
   ```
2. Kill proses atau ubah port di `backend/.env`:
   ```
   PORT=5001
   ```

### Frontend tidak bisa connect ke backend

**Error**: `Network Error` atau `CORS error`

**Solusi**:
1. Pastikan backend running di port 5000
2. Cek `vite.config.ts` di frontend:
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:5000',
       changeOrigin: true,
     },
   }
   ```
3. Restart frontend dev server

### Dependencies belum terinstall

**Error**: `Cannot find module`

**Solusi**:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd frontend
npm install
```

## 📊 Verifikasi Setup

### 1. Cek Backend API

Buka browser: `http://localhost:5000/api`

Harus muncul response atau error 404 (artinya server running)

### 2. Cek Frontend

Buka browser: `http://localhost:3000`

Harus muncul halaman login

### 3. Test Login

1. Buka `http://localhost:3000`
2. Login dengan ADMIN001 / admin123
3. Harus redirect ke Dashboard

## 🎯 Fitur yang Bisa Dicoba

1. **Dashboard**
   - Lihat summary OHE
   - Lihat charts time distribution
   - Lihat trend analysis

2. **Activities**
   - Lihat daftar Value Time activities
   - Lihat daftar Direct activities
   - Lihat daftar Indirect activities
   - Lihat daftar Loss Time activities

3. **Input OHE**
   - Input activity baru
   - Pilih activity dari list
   - Auto-calculate actual time
   - Lihat daily activities

4. **Reports**
   - Lihat summary work hours
   - Time analysis
   - Efficiency metrics

## 🛠️ Development Tips

### Hot Reload

- Backend: Menggunakan nodemon, auto-restart saat ada perubahan
- Frontend: Vite hot module replacement, auto-refresh

### Debugging

- Backend: Lihat console output di terminal backend
- Frontend: Buka DevTools (F12) di browser

### Database Management

Gunakan MongoDB Compass atau mongosh untuk melihat data:

```bash
mongosh
use ohe_maintenance
db.users.find()
db.valuetimelists.find()
```

## 📞 Support

Jika ada masalah saat setup, cek:
1. MongoDB sudah running
2. Dependencies sudah terinstall
3. Port 5000 dan 3000 tidak digunakan
4. File `.env` sudah benar

## 🎉 Selamat!

Aplikasi OHE Maintenance sudah siap digunakan!
