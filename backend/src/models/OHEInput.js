const mongoose = require('mongoose');

const oheInputSchema = new mongoose.Schema({
  record_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  nama: {
    type: String,
    required: true,
    trim: true
  },
  jenis_pekerjaan: {
    type: String,
    required: true,
    trim: true
  },
  kategori_pekerjaan: {
    type: String,
    enum: ['Corective', 'Preventive', 'Proyek', 'Indirect'],
    required: true
  },
  waktu: {
    type: Date,
    required: true
  },
  jam_mulai: {
    type: String,
    required: true
  },
  jam_selesai: {
    type: String,
    required: true
  },
  actual_time_min: {
    type: Number,
    required: true,
    min: 0
  },
  standard_time_min: {
    type: Number,
    default: 0,
    min: 0
  },
  pemakaian_bahan: {
    type: String,
    trim: true
  },
  pekerjaan_indirect: {
    type: String,
    trim: true
  },
  durasi_indirect_min: {
    type: Number,
    default: 0,
    min: 0
  },
  loss_time: {
    type: String,
    trim: true
  },
  durasi_loss_time_min: {
    type: Number,
    default: 0,
    min: 0
  },
  created_by: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

oheInputSchema.pre('save', function() {
  this.updated_at = Date.now();
});

// Generate record_id
oheInputSchema.statics.generateRecordId = async function() {
  const count = await this.countDocuments();
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `OHE-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
};

module.exports = mongoose.model('OHEInput', oheInputSchema);
