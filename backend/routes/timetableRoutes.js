const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Import the controllers
const {
  addTimetableEntry,
  getMyTimetable, // <-- 1. Import the new function
} = require('../controllers/timetableController');

// --- Admin Route ---
router.post(
  '/',
  protect, // Checks for login token
  isAdmin, // Checks if user is 'admin'
  addTimetableEntry
);

// --- Student & Faculty Route ---
// 2. Add the new GET route
// This route *must* be defined before any routes with /:id
router.get(
  '/my',
  protect, // Just needs a login, any role can access
  getMyTimetable
);

module.exports = router;