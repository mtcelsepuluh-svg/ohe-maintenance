/**
 * Script untuk initialize database
 * Jalankan dengan: node src/scripts/initDatabase.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const setupDatabase = require('../utils/setupDatabase');

// Load environment variables
dotenv.config();

async function initDatabase() {
  try {
    console.log('🚀 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ohe-mtc');
    
    console.log('✅ Connected to MongoDB');
    console.log('');
    
    // Run setup
    await setupDatabase();
    
    console.log('');
    console.log('🎉 Database initialization completed!');
    console.log('');
    console.log('📊 Summary:');
    console.log('   - Admin user created (ADMIN001 / admin123)');
    console.log('   - Default settings configured');
    console.log('   - 70 Value Time activities imported');
    console.log('   - Sample Direct & Indirect activities created');
    console.log('   - Sample machines created');
    console.log('');
    console.log('🔐 Login credentials:');
    console.log('   User ID: ADMIN001');
    console.log('   PIN: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the default PIN after first login!');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error initializing database:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Make sure MongoDB is running');
    console.error('   Windows: net start MongoDB');
    console.error('   Linux: sudo systemctl start mongod');
    console.error('');
    console.error('2. Check MONGODB_URI in .env file');
    console.error('');
    process.exit(1);
  }
}

initDatabase();
