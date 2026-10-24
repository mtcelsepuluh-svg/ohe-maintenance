const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/database');

// Route imports
const authRoutes = require('./routes/authRoutes');
const valueTimeRoutes = require('./routes/valueTimeRoutes');
const directRoutes = require('./routes/directRoutes');
const indirectRoutes = require('./routes/indirectRoutes');
const lossTimeRoutes = require('./routes/lossTimeRoutes');
const oheInputRoutes = require('./routes/oheInputRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const logRoutes = require('./routes/logRoutes');
const workTimeRoutes = require('./routes/workTimeRoutes');
const googleSyncRoutes = require('./routes/googleSyncRoutes');
const importRoutes = require('./routes/importRoutes');
const mekanikRoutes = require('./routes/mekanikRoutes');

// Utils
const syncScheduler = require('./utils/syncScheduler');

// Initialize express
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'OHE MTC - Overall Human Efficiency API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      valueTimes: '/api/valuetimes',
      directs: '/api/directs',
      indirects: '/api/indirects',
      lossTimes: '/api/losstimes',
      oheInputs: '/api/oheinputs',
      settings: '/api/settings',
      logs: '/api/logs',
      workTime: '/api/worktime',
      import: '/api/import'
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', timestamp: new Date().toISOString() });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/valuetimes', valueTimeRoutes);
app.use('/api/directs', directRoutes);
app.use('/api/indirects', indirectRoutes);
app.use('/api/losstimes', lossTimeRoutes);
app.use('/api/oheinputs', oheInputRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/worktime', workTimeRoutes);
app.use('/api/google-sync', googleSyncRoutes);
app.use('/api/import', importRoutes);
app.use('/api/mekaniks', mekanikRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
    ╔══════════════════════════════════════════╗
    ║  OHE Maintenance API Server              ║
    ║  Port: ${PORT}                              ║
    ║  Environment: ${process.env.NODE_ENV || 'development'}           ║
    ╚══════════════════════════════════════════╝
  `);

  // Start sync scheduler if Google Sheets is configured
  if (process.env.GOOGLE_SHEETS_SPREADSHEET_ID && 
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID !== 'your_spreadsheet_id_here') {
    syncScheduler.start();
    console.log('🔄 Google Sheets auto-sync enabled');
  } else {
    console.log('⚠️  Google Sheets not configured. Auto-sync disabled.');
    console.log('   Set GOOGLE_SHEETS_SPREADSHEET_ID in .env to enable.');
  }
});

module.exports = app;
