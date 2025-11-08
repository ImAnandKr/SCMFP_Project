const express = require('express');
const router = express.Router();
const {
  protect,
  isFaculty,
  isStudent, // <-- 1. Import isStudent
} = require('../middleware/authMiddleware');

// Import controllers
const {
  startClassSession,
  markAttendance,
  markAttendanceByQR,
  endClassSession,
  getOngoingSession,
  getSessionByCode,
} = require('../controllers/classController');

// --- Faculty Route ---
router.post(
  '/:timetableId/start',
  protect,
  isFaculty,
  startClassSession
);

// GET ongoing session for a timetable entry (used by frontend to avoid 400 when starting)
router.get('/:timetableId/session', protect, getOngoingSession);

// Verify attendance OTP -> returns matching session (if ongoing)
router.get('/verify', protect, getSessionByCode);

// --- Student Route ---
// @desc    Mark attendance for a live class (OTP method)
// @route   POST /api/classes/:sessionId/attend
// @access  Private (Student Only)
router.post(
  '/:sessionId/attend',
  protect,
  isStudent,
  markAttendance
);

// --- Student Route ---
// @desc    Mark attendance via QR (bypasses OTP, QR is assumed to be displayed inside class)
// @route   POST /api/classes/:sessionId/attend-qr
// @access  Private (Student Only)
router.post('/:sessionId/attend-qr', protect, isStudent, markAttendanceByQR);

// --- Faculty Route ---
// End a live class session
router.post(
  '/:sessionId/end',
  protect,
  isFaculty,
  endClassSession
);

module.exports = router;
