# OHE Maintenance Frontend

Aplikasi frontend untuk sistem OHE (Overall Human Efficiency) Maintenance tracking.

## 🚀 Tech Stack

- **React 18** dengan TypeScript
- **Vite** - Build tool yang cepat
- **Bootstrap 5** - UI framework
- **Chart.js** - Visualisasi data
- **React Router** - Navigation
- **Axios** - HTTP client

## 📦 Instalasi

```bash
# Install dependencies
npm install

# Jalankan aplikasi (development)
npm run dev

# Build untuk production
npm run build

# Preview production build
npm run preview
```

## 🔧 Konfigurasi

Aplikasi ini menggunakan proxy untuk API calls ke backend. Konfigurasi ada di `vite.config.ts`:

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

Pastikan backend sudah berjalan di `http://localhost:5000`.

## 📁 Struktur Folder

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/            # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Activities.tsx
│   │   ├── InputOHE.tsx
│   │   └── Reports.tsx
│   ├── services/         # API services
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── dashboardService.ts
│   │   ├── activityService.ts
│   │   └── oheService.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🎨 Fitur

### 1. Dashboard
- Visualisasi OHE performance
- Charts untuk time distribution (Value Time, Direct, Indirect, Loss)
- Trend analysis
- Summary metrics

### 2. Activities Management
- Lihat daftar Value Time activities
- Lihat daftar Direct activities
- Lihat daftar Indirect activities
- Lihat daftar Loss Time activities
- Search dan filter activities

### 3. Input OHE
- Form untuk input activity baru
- Auto-calculate actual time
- Pilih dari daftar activities yang sudah ada
- Track daily activities

### 4. Reports
- Summary work hours
- Time analysis
- Efficiency metrics
- Export data (coming soon)

## 🔐 Authentication

Default credentials:
- **User ID**: ADMIN001
- **PIN**: admin123

## 🎯 API Endpoints

Frontend ini terhubung dengan backend API di `/api`:
- `/api/auth` - Authentication
- `/api/dashboard` - Dashboard data
- `/api/valuetimes` - Value Time activities
- `/api/directs` - Direct activities
- `/api/indirects` - Indirect activities
- `/api/losstimes` - Loss Time activities
- `/api/oheinputs` - OHE input data

## 📱 Responsive Design

Aplikasi ini fully responsive dan dapat diakses dari:
- Desktop
- Tablet
- Mobile

## 🎨 Design System

- **Primary Color**: #1e3a8a (Dark Blue)
- **Secondary Color**: #3b82f6 (Blue)
- **Success**: #10b981 (Green) - Value Time
- **Warning**: #f59e0b (Orange) - Indirect Time
- **Danger**: #ef4444 (Red) - Loss Time

## 🚀 Development

```bash
# Run development server
npm run dev

# Lint code
npm run lint

# Type check
npm run tsc
```

## 📝 License

Copyright © 2026 OHE Maintenance
