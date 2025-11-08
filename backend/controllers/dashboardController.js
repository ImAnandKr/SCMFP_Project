// const ClassSession = require('../models/ClassSession');
// const Attendance = require('../models/Attendance');
// // @desc    Get all currently ongoing classes
// // @route   GET /api/dashboard/ongoing
// // @access  Private (Admin Only)
// const getOngoingClasses = async (req, res) => {
//   try {
//     // 1. Find all sessions with status 'ongoing'
//     const ongoingClasses = await ClassSession.find({ status: 'ongoing' })
//       .populate('faculty', 'name userId department') // Get faculty's name, ID, and dept
//       .sort({ startTime: 1 }); // Show the earliest classes first

//     if (!ongoingClasses) {
//       return res.status(404).json({ message: 'No ongoing classes found' });
//     }
// const getOngoingClasses = async (req, res) => {
//     // 2. Send the list
//     res.status(200).json(ongoingClasses);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };

// const getSessionAttendance = async (req, res) => {
//   try {
//     const { sessionId } = req.params;

//     // 1. Find all attendance records for this session
//     const attendanceRecords = await Attendance.find({ classSession: sessionId })
//       .populate('student', 'name userId department') // Get student's details
//       .sort({ markedAt: 1 }); // Show first students to mark first

//     if (!attendanceRecords) {
//       return res.status(404).json({ message: 'No attendance records found for this session' });
//     }

//     // 2. Send the list
//     res.status(200).json(attendanceRecords);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };

// module.exports = {
//   getOngoingClasses,
//   getSessionAttendance, // <-- 3. EXPORT
// };

// // --- Dashboard aggregated stats ---
// // GET /api/dashboard/stats
// // Access: Admin
// const Timetable = require('../models/Timetable');
// const User = require('../models/User');

// const getDashboardStats = async (req, res) => {
//   try {
//     // total number of classes in timetable
//     const totalClasses = await Timetable.countDocuments();

//     // ongoing sessions
//     const ongoing = await ClassSession.find({ status: 'ongoing' });
//     const activeClasses = ongoing.length;

//     // total faculty
//     const totalFaculty = await User.countDocuments({ role: 'faculty' });

//     // active faculty (distinct faculty ids in ongoing)
//     const activeFaculty = new Set(ongoing.map(s => s.faculty.toString())).size;

//     // average attendance: for completed sessions, compute present / students for that session and average
//     // We'll sample the last 50 completed sessions to compute a reasonable average
//     const completed = await ClassSession.find({ status: 'completed' }).sort({ endTime: -1 }).limit(50);
//     let totalPercent = 0;
//     let counted = 0;
//     for (const sess of completed) {
//       // number of students in that section
//       const studentsCount = await User.countDocuments({ role: 'student', department: sess.department, semester: sess.semester, section: sess.section });
//       if (studentsCount === 0) continue;
//       const presentCount = await Attendance.countDocuments({ classSession: sess._id, status: 'present' });
//       const percent = Math.round((presentCount / studentsCount) * 100);
//       totalPercent += percent;
//       counted += 1;
//     }
//     const averageAttendance = counted > 0 ? Math.round(totalPercent / counted) : 0;

//     // classroom utilization: percent of classrooms in use (ongoing / total distinct classrooms in timetable)
//     const distinctRooms = await Timetable.distinct('classroom');
//     const classroomUtilization = distinctRooms.length > 0 ? Math.round((activeClasses / distinctRooms.length) * 100) : 0;

//     res.status(200).json({ totalClasses, activeClasses, totalFaculty, activeFaculty, averageAttendance, classroomUtilization });
//   } catch (error) {
//     console.error('[getDashboardStats]', error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };

// module.exports.getDashboardStats = getDashboardStats;


// // ------------------------------------------------------------------
// // Student report: subject-wise attendance (and placeholder for scores)
// // GET /api/dashboard/student/:studentId/report
// // Access: Admin or Faculty
// const mongoose = require('mongoose');

// const getStudentReport = async (req, res) => {
//   try {
//     const { studentId } = req.params;

//     // Find student by userId or _id
//     let student = await User.findOne({ userId: studentId });
//     if (!student) {
//       if (mongoose.Types.ObjectId.isValid(studentId)) {
//         student = await User.findById(studentId);
//       }
//     }

//     if (!student || student.role !== 'student') {
//       return res.status(404).json({ message: 'Student not found' });
//     }

//     // Build filter: sessions in same dept/sem/section
//     const filter = {
//       department: student.department,
//       semester: student.semester,
//       section: student.section,
//     };

//     // 1) Count total sessions per subject
//     const sessionsAgg = await ClassSession.aggregate([
//       { $match: filter },
//       { $group: { _id: '$subject', totalSessions: { $sum: 1 } } },
//       { $project: { subject: '$_id', totalSessions: 1, _id: 0 } }
//     ]);

//     // 2) Count present marks per subject for this student
//     const attendanceAgg = await Attendance.aggregate([
//       // lookup session to get subject
//       { $match: { student: mongoose.Types.ObjectId(student._id), status: 'present' } },
//       { $lookup: {
//           from: 'classsessions',
//           localField: 'classSession',
//           foreignField: '_id',
//           as: 'session'
//       }},
//       { $unwind: '$session' },
//       { $match: { 'session.department': student.department, 'session.semester': student.semester, 'session.section': student.section } },
//       { $group: { _id: '$session.subject', presentCount: { $sum: 1 } } },
//       { $project: { subject: '$_id', presentCount: 1, _id: 0 } }
//     ]);

//     // Merge results
//     const mapPresent = {};
//     attendanceAgg.forEach(a => { mapPresent[a.subject] = a.presentCount; });

//     const report = sessionsAgg.map(s => {
//       const present = mapPresent[s.subject] || 0;
//       const percentage = s.totalSessions > 0 ? Math.round((present / s.totalSessions) * 100) : 0;
//       return {
//         subject: s.subject,
//         totalSessions: s.totalSessions,
//         presentCount: present,
//         attendancePercent: percentage,
//         scores: [] // placeholder: no scores model available
//       };
//     });

//     res.status(200).json({ student: { _id: student._id, name: student.name, userId: student.userId }, report });
//   } catch (error) {
//     console.error('[getStudentReport]', error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };

// module.exports.getStudentReport = getStudentReport;

// // @desc    Get student counts grouped by section (optionally filtered by department & semester)
// // @route   GET /api/dashboard/sections?department=...&semester=...
// // @access  Private (Admin or Faculty)
// const getStudentCountsBySection = async (req, res) => {
//   try {
//     // Only admin or faculty can view this
//     if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'faculty')) {
//       return res.status(401).json({ message: 'Not authorized' });
//     }

//     const { department, semester } = req.query;

//     // Build match stage
//     const match = { role: 'student' };
//     if (department) match.department = department;
//     if (semester) match.semester = Number(semester);

//     // Aggregate students grouped by section
//     const results = await require('../models/User').aggregate([
//       { $match: match },
//       { $group: { _id: '$section', count: { $sum: 1 } } },
//       { $project: { section: '$_id', count: 1, _id: 0 } },
//       { $sort: { section: 1 } },
// module.exports = {
//   getOngoingClasses,
//   getSessionAttendance,
//   getDashboardStats,
//   getStudentReport,
//   getStudentCountsBySection,
// };
//     console.error('[getStudentCountsBySection]', error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };

// controllers/dashboardController.js

const mongoose = require('mongoose');
const ClassSession = require('../models/ClassSession');
const Attendance = require('../models/Attendance');
const Timetable = require('../models/Timetable');
const User = require('../models/User');

/**
 * GET /api/dashboard/ongoing
 * Private (Admin)
 */
const getOngoingClasses = async (req, res) => {
  try {
    const ongoingClasses = await ClassSession.find({ status: 'ongoing' })
      .populate('faculty', 'name userId department')
      .sort({ startTime: 1 });

    if (!ongoingClasses || ongoingClasses.length === 0) {
      return res.status(404).json({ message: 'No ongoing classes found' });
    }

    return res.status(200).json(ongoingClasses);
  } catch (error) {
    console.error('[getOngoingClasses]', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * GET /api/dashboard/session/:sessionId/attendance
 * Private (Admin)
 */
const getSessionAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: 'Invalid session id' });
    }

    const attendanceRecords = await Attendance.find({ classSession: sessionId })
      .populate('student', 'name userId department')
      .sort({ markedAt: 1 });

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for this session' });
    }

    return res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error('[getSessionAttendance]', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * GET /api/dashboard/stats
 * Private (Admin)
 */
const getDashboardStats = async (req, res) => {
  try {
    const totalClasses = await Timetable.countDocuments();

    const ongoing = await ClassSession.find({ status: 'ongoing' });
    const activeClasses = ongoing.length;

    const totalFaculty = await User.countDocuments({ role: 'faculty' });

    const activeFaculty = new Set(ongoing.map(s => String(s.faculty))).size;

    const completed = await ClassSession.find({ status: 'completed' })
      .sort({ endTime: -1 })
      .limit(50);

    let totalPercent = 0;
    let counted = 0;

    for (const sess of completed) {
      const studentsCount = await User.countDocuments({
        role: 'student',
        department: sess.department,
        semester: sess.semester,
        section: sess.section,
      });
      if (studentsCount === 0) continue;

      const presentCount = await Attendance.countDocuments({
        classSession: sess._id,
        status: 'present',
      });

      totalPercent += Math.round((presentCount / studentsCount) * 100);
      counted += 1;
    }

    const averageAttendance = counted > 0 ? Math.round(totalPercent / counted) : 0;

    const distinctRooms = await Timetable.distinct('classroom');
    const classroomUtilization =
      distinctRooms.length > 0 ? Math.round((activeClasses / distinctRooms.length) * 100) : 0;

    return res.status(200).json({
      totalClasses,
      activeClasses,
      totalFaculty,
      activeFaculty,
      averageAttendance,
      classroomUtilization,
    });
  } catch (error) {
    console.error('[getDashboardStats]', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * GET /api/dashboard/student/:studentId/report
 * Private (Admin or Faculty)
 */
const getStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;

    let student = await User.findOne({ userId: studentId });
    if (!student && mongoose.Types.ObjectId.isValid(studentId)) {
      student = await User.findById(studentId);
    }

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const filter = {
      department: student.department,
      semester: student.semester,
      section: student.section,
    };

    const sessionsAgg = await ClassSession.aggregate([
      { $match: filter },
      { $group: { _id: '$subject', totalSessions: { $sum: 1 } } },
      { $project: { subject: '$_id', totalSessions: 1, _id: 0 } },
    ]);

    const attendanceAgg = await Attendance.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(student._id), status: 'present' } },
      {
        $lookup: {
          from: 'classsessions',
          localField: 'classSession',
          foreignField: '_id',
          as: 'session',
        },
      },
      { $unwind: '$session' },
      {
        $match: {
          'session.department': student.department,
          'session.semester': student.semester,
          'session.section': student.section,
        },
      },
      { $group: { _id: '$session.subject', presentCount: { $sum: 1 } } },
      { $project: { subject: '$_id', presentCount: 1, _id: 0 } },
    ]);

    const mapPresent = Object.create(null);
    for (const a of attendanceAgg) mapPresent[a.subject] = a.presentCount;

    const report = sessionsAgg.map(s => {
      const present = mapPresent[s.subject] || 0;
      const percentage = s.totalSessions > 0 ? Math.round((present / s.totalSessions) * 100) : 0;
      return {
        subject: s.subject,
        totalSessions: s.totalSessions,
        presentCount: present,
        attendancePercent: percentage,
        scores: [], // placeholder
      };
    });

    return res.status(200).json({
      student: { _id: student._id, name: student.name, userId: student.userId },
      report,
    });
  } catch (error) {
    console.error('[getStudentReport]', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * GET /api/dashboard/sections?department=...&semester=...
 * Private (Admin or Faculty)
 */
const getStudentCountsBySection = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'faculty')) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { department, semester } = req.query;

    const match = { role: 'student' };
    if (department) match.department = department;
    if (semester) match.semester = Number(semester);

    const results = await User.aggregate([
      { $match: match },
      { $group: { _id: '$section', count: { $sum: 1 } } },
      { $project: { section: '$_id', count: 1, _id: 0 } },
      { $sort: { section: 1 } },
    ]);

    return res.status(200).json(results);
  } catch (error) {
    console.error('[getStudentCountsBySection]', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getOngoingClasses,
  getSessionAttendance,
  getDashboardStats,
  getStudentReport,
  getStudentCountsBySection,
};
