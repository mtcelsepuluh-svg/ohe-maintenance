/**
 * Database Initialization Script
 * Fungsi ini akan setup database dengan data awal
 * Aman dijalankan berulang kali
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Mekanik = require('../models/Mekanik');
const Settings = require('../models/Settings');
const DirectList = require('../models/DirectList');
const IndirectList = require('../models/IndirectList');
const ValueTimeList = require('../models/ValueTimeList');
const LossTimeList = require('../models/LossTimeList');
const valueTimeActivities = require('../data/valueTimeActivities');
const indirectTimeActivities = require('../data/indirectTimeActivities');
const lossTimeActivities = require('../data/lossTimeActivities');

/**
 * Setup database dengan data awal
 */
async function setupDatabase() {
  try {
    console.log('🚀 Starting database initialization...');

    // 1. Create default admin user
    await ensureAdminUser();

    // 2. Create default settings
    await ensureDefaultSettings();

    // 3. Create Value Time activities
    await ensureValueTimeActivities();

    // 4. Create Indirect Time activities
    await ensureIndirectTimeActivities();

    // 5. Create Loss Time activities
    await ensureLossTimeActivities();

    // 6. Create sample direct activities
    await ensureDirectActivities();

    // 7. Create sample indirect activities (legacy)
    await ensureSampleIndirectActivities();

    // 8. Create sample machines
    await ensureSampleMachines();

    console.log('✅ Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

/**
 * Create default admin user if not exists
 */
async function ensureAdminUser() {
  try {
    const adminExists = await User.findOne({ user_id: 'ADMIN001' });
    
    if (!adminExists) {
      const hashedPin = await bcrypt.hash('admin123', 10);
      
      await User.create({
        user_id: 'ADMIN001',
        pin: hashedPin,
        name: 'Administrator',
        role: 'ADMIN',
        machine: 'ALL',
        status: 'active'
      });
      
      console.log('✓ Default admin user created');
      console.log('  User ID: ADMIN001');
      console.log('  PIN: admin123');
    } else {
      console.log('✓ Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

/**
 * Create default settings
 */
async function ensureDefaultSettings() {
  try {
    const defaultSettings = [
      {
        key: 'working_start_monday_thursday',
        value: '07:30',
        description: 'Working start time (Monday-Thursday)'
      },
      {
        key: 'working_end_monday_thursday',
        value: '15:00',
        description: 'Working end time (Monday-Thursday)'
      },
      {
        key: 'break_start_monday_thursday',
        value: '12:00',
        description: 'Break start time (Monday-Thursday)'
      },
      {
        key: 'break_end_monday_thursday',
        value: '12:30',
        description: 'Break end time (Monday-Thursday)'
      },
      {
        key: 'total_working_minutes_monday_thursday',
        value: 420,
        description: 'Total effective working time in minutes (Monday-Thursday)'
      },
      {
        key: 'working_start_friday',
        value: '07:00',
        description: 'Working start time (Friday)'
      },
      {
        key: 'working_end_friday',
        value: '15:00',
        description: 'Working end time (Friday)'
      },
      {
        key: 'break_start_friday',
        value: '11:45',
        description: 'Break start time (Friday)'
      },
      {
        key: 'break_end_friday',
        value: '12:45',
        description: 'Break end time (Friday)'
      },
      {
        key: 'total_working_minutes_friday',
        value: 390,
        description: 'Total effective working time in minutes (Friday)'
      },
      {
        key: 'working_start_saturday',
        value: '07:30',
        description: 'Working start time (Saturday)'
      },
      {
        key: 'working_end_saturday',
        value: '13:00',
        description: 'Working end time (Saturday)'
      },
      {
        key: 'break_start_saturday',
        value: '11:30',
        description: 'Break start time (Saturday)'
      },
      {
        key: 'break_end_saturday',
        value: '12:00',
        description: 'Break end time (Saturday)'
      },
      {
        key: 'total_working_minutes_saturday',
        value: 300,
        description: 'Total effective working time in minutes (Saturday)'
      },
      {
        key: 'target_ohe',
        value: 85,
        description: 'Default target OHE (%)'
      },
      {
        key: 'benchmark_ohe',
        value: 90,
        description: 'Default benchmark OHE (%)'
      },
      {
        key: 'timezone',
        value: 'Asia/Jakarta',
        description: 'Application timezone'
      },
      {
        key: 'application_name',
        value: 'OHE MTC - Overall Human Efficiency',
        description: 'Application name'
      }
    ];

    for (const setting of defaultSettings) {
      const exists = await Settings.findOne({ key: setting.key });
      
      if (!exists) {
        await Settings.create(setting);
        console.log(`✓ Setting created: ${setting.key}`);
      } else {
        console.log(`✓ Setting already exists: ${setting.key}`);
      }
    }
  } catch (error) {
    console.error('Error creating default settings:', error);
  }
}

/**
 * Create Value Time activities from data file
 */
async function ensureValueTimeActivities() {
  try {
    let created = 0;
    let existing = 0;

    for (const activity of valueTimeActivities) {
      const exists = await ValueTimeList.findOne({ activity_code: activity.activity_code });
      
      if (!exists) {
        await ValueTimeList.create(activity);
        created++;
      } else {
        existing++;
      }
    }
    
    console.log(`✓ Value Time activities: ${created} created, ${existing} already exists`);
    console.log(`  Total: ${valueTimeActivities.length} activities`);
    console.log(`  - Corrective: ${valueTimeActivities.filter(a => a.sub_category === 'Corrective').length}`);
    console.log(`  - Preventive: ${valueTimeActivities.filter(a => a.sub_category === 'Preventive').length}`);
    console.log(`  - Pekerjaan Proyek MTC: ${valueTimeActivities.filter(a => a.sub_category === 'Pekerjaan Proyek MTC').length}`);
  } catch (error) {
    console.error('Error creating Value Time activities:', error);
  }
}

/**
 * Create Indirect Time activities from data file
 */
async function ensureIndirectTimeActivities() {
  try {
    let created = 0;
    let existing = 0;

    for (const activity of indirectTimeActivities) {
      const exists = await IndirectList.findOne({ activity_code: activity.activity_code });
      
      if (!exists) {
        await IndirectList.create(activity);
        created++;
      } else {
        existing++;
      }
    }
    
    console.log(`✓ Indirect Time activities: ${created} created, ${existing} already exists`);
    console.log(`  Total: ${indirectTimeActivities.length} activities`);
  } catch (error) {
    console.error('Error creating Indirect Time activities:', error);
  }
}

/**
 * Create Loss Time activities from data file
 */
async function ensureLossTimeActivities() {
  try {
    let created = 0;
    let existing = 0;

    for (const activity of lossTimeActivities) {
      const exists = await LossTimeList.findOne({ activity_code: activity.activity_code });
      
      if (!exists) {
        await LossTimeList.create(activity);
        created++;
      } else {
        existing++;
      }
    }
    
    console.log(`✓ Loss Time activities: ${created} created, ${existing} already exists`);
    console.log(`  Total: ${lossTimeActivities.length} activities`);
  } catch (error) {
    console.error('Error creating Loss Time activities:', error);
  }
}

/**
 * Create sample direct activities
 */
async function ensureDirectActivities() {
  try {
    const directActivities = [
      {
        activity_code: 'DIR-001',
        activity_name: 'Loading Material',
        standard_time: 15,
        unit: 'minutes',
        description: 'Loading raw material into machine',
        status: 'active'
      },
      {
        activity_code: 'DIR-002',
        activity_name: 'Machine Operation',
        standard_time: 120,
        unit: 'minutes',
        description: 'Operating machine during production',
        status: 'active'
      },
      {
        activity_code: 'DIR-003',
        activity_name: 'Quality Check',
        standard_time: 10,
        unit: 'minutes',
        description: 'Checking product quality',
        status: 'active'
      },
      {
        activity_code: 'DIR-004',
        activity_name: 'Unloading Product',
        standard_time: 10,
        unit: 'minutes',
        description: 'Unloading finished product from machine',
        status: 'active'
      }
    ];

    for (const activity of directActivities) {
      const exists = await DirectList.findOne({ activity_code: activity.activity_code });
      
      if (!exists) {
        await DirectList.create(activity);
        console.log(`✓ Direct activity created: ${activity.activity_code}`);
      } else {
        console.log(`✓ Direct activity already exists: ${activity.activity_code}`);
      }
    }
  } catch (error) {
    console.error('Error creating direct activities:', error);
  }
}

/**
 * Create sample indirect activities (legacy - kept for backward compatibility)
 */
async function ensureSampleIndirectActivities() {
  // No longer needed - using indirectTimeActivities data file instead
  return;
}

/**
 * Create sample machines
 */
async function ensureSampleMachines() {
  try {
    const machines = [
      {
        nama_mekanik: 'CNC Machine 01',
        machine_code: 'CNC-001',
        machine_name: 'CNC Machine 01',
        target_ohe: 85,
        benchmark_ohe: 90,
        status: 'active'
      },
      {
        nama_mekanik: 'CNC Machine 02',
        machine_code: 'CNC-002',
        machine_name: 'CNC Machine 02',
        target_ohe: 85,
        benchmark_ohe: 90,
        status: 'active'
      },
      {
        nama_mekanik: 'Press Machine 01',
        machine_code: 'PRESS-001',
        machine_name: 'Press Machine 01',
        target_ohe: 80,
        benchmark_ohe: 85,
        status: 'active'
      }
    ];

    for (const machine of machines) {
      const exists = await Mekanik.findOne({ machine_code: machine.machine_code });
      
      if (!exists) {
        await Mekanik.create(machine);
        console.log(`✓ Machine created: ${machine.machine_code}`);
      } else {
        console.log(`✓ Machine already exists: ${machine.machine_code}`);
      }
    }
  } catch (error) {
    console.error('Error creating sample machines:', error);
  }
}

module.exports = setupDatabase;
