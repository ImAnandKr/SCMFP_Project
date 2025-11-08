// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Common fields
  userId: { type: String, required: true, unique: true }, // e.g., Student ID, Employee ID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Will be hashed
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    required: true
  },

  // Role-specific fields
  department: { type: String, required: true },
  
  // Student-specific
  semester: { type: Number, 'default': null },
  section: { type: String, 'default': null },

  // Faculty-specific
  designation: { type: String, 'default': null } // e.g., Professor, Asst. Professor
  
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);