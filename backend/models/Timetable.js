// models/Timetable.js

const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  dayOfWeek: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 6 // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  },
  startTime: { type: String, required: true }, // e.g., "09:00"
  endTime: { type: String, required: true }, // e.g., "10:00"
  
  subject: { type: String, required: true },
  subjectCode: { type: String, required: true },

  faculty: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Links to the User model
    required: true 
  },
  classroom: { type: String, required: true }, // e.g., "B-301"

  // Defines who should attend this class
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  section: { type: String, required: true }

}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);