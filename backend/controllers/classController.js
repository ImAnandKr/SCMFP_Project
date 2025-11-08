const ClassSession = require('../models/ClassSession');
const Timetable = require('../models/Timetable');
const Attendance = require('../models/Attendance');
const crypto = require('crypto');

// Utility function to generate a simple 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Utility function to generate QR code data
const generateQRData = (sessionId, timestamp) => {
  const data = `${sessionId}-${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex').substr(0, 12);
};

// @desc    Start a live class session
// @route   POST /api/classes/:timetableId/start
// @access  Private (Faculty Only)
const startClassSession = async (req, res) => {
  try {
    const { timetableId } = req.params;

    // Debug logging to help diagnose 400 responses
    console.log(`[startClassSession] timetableId=${timetableId} user=${req.user?._id}`);

    // 1. Find the master timetable entry
    const timetableEntry = await Timetable.findById(timetableId);
    if (!timetableEntry) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    // 2. Security Check: Is the logged-in faculty the one assigned to this class?
    if (timetableEntry.faculty.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'You are not assigned to this class' });
    }

    // 3. Check if a session for this class is already ongoing
    const existingSession = await ClassSession.findOne({
      timetableEntry: timetableId,
      status: 'ongoing',
    });
    console.log(`[startClassSession] existingSession=${!!existingSession}`);
    if (existingSession) {
      return res.status(400).json({ message: 'Class session is already ongoing' });
    }

    // 4. Create the new live session
    const newSession = new ClassSession({
      timetableEntry: timetableId,
      subject: timetableEntry.subject,
      faculty: req.user._id,
      classroom: timetableEntry.classroom,
      department: timetableEntry.department,
      semester: timetableEntry.semester,
      section: timetableEntry.section,
      status: 'ongoing',
      startTime: new Date(), // Set start time to now
      attendanceCode: generateOTP(), // Generate a unique OTP
    });

    // 5. Save the session to the database
    const createdSession = await newSession.save();

    // --- 6. SOCKET.IO INTEGRATION ---
    // Get the 'io' object we stored in app
    const io = req.app.get('socketio');
    
    // We need to populate faculty data to send to the dashboard
    const dataToSend = await createdSession.populate('faculty', 'name');
    
    // Emit an event to all connected clients
    io.emit('classStarted', dataToSend);
    // ---------------------------------

    res.status(201).json(createdSession);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc  Get ongoing session for a timetable entry (if any)
// @route GET /api/classes/:timetableId/session
// @access Private (authenticated)
const getOngoingSession = async (req, res) => {
  try {
    const { timetableId } = req.params;
    const session = await ClassSession.findOne({ timetableEntry: timetableId, status: 'ongoing' })
      .populate('faculty', 'name');

    if (!session) {
      return res.status(404).json({ message: 'No ongoing session' });
    }

    return res.status(200).json(session);
  } catch (error) {
    console.error('[getOngoingSession]', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mark attendance for a live class
// @route   POST /api/classes/:sessionId/attend
// @access  Private (Student Only)
const markAttendance = async (req, res) => {
  const { sessionId } = req.params;
  const { attendanceCode } = req.body;
  const studentId = req.user._id; // Get student from 'protect' middleware

  if (!attendanceCode) {
    return res.status(400).json({ message: 'Attendance code is required' });
  }

  try {
    // 1. Find the live class session
    const classSession = await ClassSession.findById(sessionId);

    // 2. Check if session exists and is 'ongoing'
    if (!classSession || classSession.status !== 'ongoing') {
      return res.status(404).json({ message: 'No ongoing class session found' });
    }

    // 3. Check if the attendance code matches
    if (classSession.attendanceCode !== attendanceCode) {
      return res.status(400).json({ message: 'Invalid attendance code' });
    }

    // 4. Check if student is in the correct class
    if (
      classSession.department !== req.user.department ||
      classSession.semester !== req.user.semester ||
      classSession.section !== req.user.section
    ) {
      return res.status(401).json({ message: 'You are not enrolled in this class' });
    }

    // 5. Check if attendance was already marked
    const alreadyMarked = await Attendance.findOne({
      classSession: sessionId,
      student: studentId,
    });

    if (alreadyMarked) {
      return res.status(400).json({ message: 'Attendance already marked' });
    }

    // 6. Create the attendance record
    const attendanceRecord = new Attendance({
      classSession: sessionId,
      student: studentId,
      status: 'present',
      markedAt: new Date(),
    });

    await attendanceRecord.save();

    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    End a live class session
// @route   POST /api/classes/:sessionId/end
// @access  Private (Faculty Only)
const endClassSession = async (req, res) => {
  const { sessionId } = req.params;
  const facultyId = req.user._id;

  try {
    // 1. Find the ongoing session
    const classSession = await ClassSession.findById(sessionId);

    if (!classSession) {
      return res.status(404).json({ message: 'Class session not found' });
    }

    // 2. Security Check: Is this the correct faculty member?
    if (classSession.faculty.toString() !== facultyId.toString()) {
      return res.status(401).json({ message: 'You are not authorized to end this class' });
    }

    // 3. Check if class is already completed
    if (classSession.status === 'completed' || classSession.status === 'cancelled') {
      return res.status(400).json({ message: 'This class session is already over' });
    }

    // 4. Update the session
    classSession.status = 'completed';
    classSession.endTime = new Date(); // Mark the end time
    classSession.attendanceCode = null; // Invalidate the attendance code

    const updatedSession = await classSession.save();

    // --- 5. SOCKET.IO INTEGRATION ---
    const io = req.app.get('socketio');
    // Emit an event with the ID of the class that just ended
    io.emit('classEnded', { sessionId: updatedSession._id });
    // ---------------------------------
    
    res.status(200).json(updatedSession);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc    Find an ongoing session by its attendance code (used by OTP verification)
// @route   GET /api/classes/verify?code=XXXXXX
// @access  Private (Student)
const getSessionByCode = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ message: 'Code is required' });

    const session = await ClassSession.findOne({ attendanceCode: String(code), status: 'ongoing' }).populate('faculty', 'name');
    if (!session) return res.status(404).json({ message: 'No matching ongoing session for this code' });

    return res.status(200).json(session);
  } catch (error) {
    console.error('[getSessionByCode]', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mark attendance via QR (no OTP required)
// @route   POST /api/classes/:sessionId/attend-qr
// @access  Private (Student Only)
const markAttendanceByQR = async (req, res) => {
  const { sessionId } = req.params;
  const studentId = req.user._id;

  try {
    // 1. Find the live class session
    const classSession = await ClassSession.findById(sessionId);

    // 2. Check if session exists and is 'ongoing'
    if (!classSession || classSession.status !== 'ongoing') {
      return res.status(404).json({ message: 'No ongoing class session found' });
    }

    // 3. Check student belongs to same dept/sem/section
    if (
      classSession.department !== req.user.department ||
      classSession.semester !== req.user.semester ||
      classSession.section !== req.user.section
    ) {
      return res.status(401).json({ message: 'You are not enrolled in this class' });
    }

    // 4. Check if attendance was already marked
    const alreadyMarked = await Attendance.findOne({ classSession: sessionId, student: studentId });
    if (alreadyMarked) return res.status(400).json({ message: 'Attendance already marked' });

    // 5. Create the attendance record
    const attendanceRecord = new Attendance({ classSession: sessionId, student: studentId, status: 'present', markedAt: new Date() });
    await attendanceRecord.save();

    return res.status(201).json({ message: 'Attendance marked successfully via QR' });
  } catch (error) {
    console.error('[markAttendanceByQR]', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  startClassSession,
  markAttendance,
  markAttendanceByQR,
  endClassSession,
  getOngoingSession,
  getSessionByCode,
};