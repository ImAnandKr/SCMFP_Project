// models/ClassSession.js

const mongoose = require('mongoose');

const classSessionSchema = new mongoose.Schema({
  // Link to the master schedule
  timetableEntry: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Timetable',
    required: true
  },

  // Information copied from the timetable for quick access
  subject: { type: String, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classroom: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  section: { type: String, required: true },

  // Real-time status fields
  status: { 
    type: String, 
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  startTime: { type: Date, default: null }, // Actual start time
  endTime: { type: Date, default: null }, // Actual end time
  
  // Attendance verification fields
  attendanceCode: {
    type: String,
    default: null  // Will store OTP
  },
  qrCodeData: {
    type: String,
    default: null  // Will store encoded session data for QR
  },
  codeExpiresAt: {
    type: Date,
    default: null
  },
  attendanceMethod: {
    type: String,
    enum: ['qr', 'otp'],
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model('ClassSession', classSessionSchema);