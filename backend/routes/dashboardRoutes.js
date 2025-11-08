const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Import controllers
const {
  getOngoingClasses,
  getSessionAttendance, // <-- 1. Import new controller
  getStudentCountsBySection,
  getStudentReport,
  getDashboardStats,
} = require('../controllers/dashboardController');

// Get all ongoing classes
router.get(
  '/ongoing',
  protect,
  isAdmin,
  getOngoingClasses
);

// @desc    Get attendance details for a specific class session
// @route   GET /api/dashboard/session/:sessionId/attendance
// @access  Private (Admin Only)
router.get(
  '/session/:sessionId/attendance', // <-- 2. Add new route
  protect,
  isAdmin,
  getSessionAttendance
);

// Get student counts grouped by section (admin or faculty)
router.get('/sections', protect, getStudentCountsBySection);

// Get a subject-wise attendance & scores report for a student (admin or faculty)
router.get('/student/:studentId/report', protect, getStudentReport);

// Dashboard aggregated stats
router.get('/stats', protect, getDashboardStats);

module.exports = router;