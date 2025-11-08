// models/Attendance.js

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  classSession: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ClassSession', 
    required: true 
  },
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['present', 'absent'], 
    'default': 'absent' 
  },
  markedAt: { type: Date, 'default': null } // Time the student marked attendance

}, { timestamps: true });

// Add a compound index to prevent duplicate attendance entries
attendanceSchema.index({ classSession: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);