# OHE Maintenance System

Sistem tracking dan monitoring Overall Human Efficiency (OHE) untuk maintenance.

## 🎯 Tentang Aplikasi

Aplikasi ini digunakan untuk:
- Tracking work hours mekanik
- Monitoring activities (Value Time, Direct, Indirect, Loss Time)
- Analisis efisiensi kerja
- Reporting dan dashboard

## 🏗️ Arsitektur

```
ohe-maintenance/
├── backend/          # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
└── frontend/         # React + TypeScript + Vite
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── App.tsx
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 atau lebih baru)
- MongoDB (running di localhost:27017)

### 1. Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Jalankan MongoDB (jika belum running)
# MongoDB harus running di localhost:27017

# Initialize database (first time only)
npm run init-db

# Jalankan backend server
npm run dev
```

Backend akan berjalan di: `http://localhost:5000`

### 2. Setup Frontend

Buka terminal baru:

```bash
# Masuk ke folder frontend
cd frontend

# Jalankan frontend dev server
npm run dev
```

Frontend akan berjalan di: `http://localhost:3000`

## 🔐 Default Login

- **User ID**: ADMIN001
- **PIN**: admin123

## 📱 Fitur Utama

### 1. Dashboard
- Visualisasi OHE performance
- Charts time distribution
- Trend analysis
- Summary metrics

### 2. Activities Management
Lihat dan kelola activities:
- ✅ Value Time - Activities yang memberikan nilai tambah
- ⚡ Direct - Direct work activities
- 🔄 Indirect - Indirect work activities
- ⚠️ Loss Time - Activities yang menyebabkan waktu hilang

### 3. Input OHE
- Input daily activities
- Auto-calculate actual time
- Track work hours per activity

### 4. Reports
- Summary work hours
- Time analysis
- Efficiency metrics

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

### Frontend
- React 18 + TypeScript
- Vite
- Bootstrap 5
- Chart.js
- React Router
- Axios

## 📊 Database Schema

### User
- user_id, name, role (ADMIN/MEKANIK)
- machine, status

### Activities
- Value Time, Direct, Indirect, Loss Time
- activity_code, activity_name
- standard_time, unit

### OHE Input
- date, shift, mekanik
- activity_code, category
- start_time, end_time, actual_time
- quantity, production_result, remarks

## 🔧 Development

### Backend Commands
```bash
npm run dev         # Run with nodemon
npm start           # Run production
npm run init-db     # Initialize database
```

### Frontend Commands
```bash
npm run dev         # Run dev server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Lint code
```

## 📝 API Documentation

Lihat dokumentasi API lengkap di: `backend/API_DOCUMENTATION.md`

### Main Endpoints
- `POST /api/auth/login` - Login
- `GET /api/dashboard` - Dashboard data
- `GET /api/valuetimes` - Value Time activities
- `GET /api/directs` - Direct activities
- `GET /api/indirects` - Indirect activities
- `GET /api/losstimes` - Loss Time activities
- `POST /api/oheinputs` - Create OHE input
- `GET /api/oheinputs/summary` - Get summary

## 🎨 Design System

- **Primary**: #1e3a8a (Dark Blue)
- **Secondary**: #3b82f6 (Blue)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Orange)
- **Danger**: #ef4444 (Red)

## 🔒 Security

- JWT-based authentication
- Password hashing dengan bcrypt
- Role-based access control (ADMIN, MEKANIK)
- Protected API endpoints

## 📞 Support

Untuk bantuan atau pertanyaan, hubungi development team.

## 📄 License

Copyright © 2026 OHE Maintenance System
