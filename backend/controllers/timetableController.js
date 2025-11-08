const Timetable = require('../models/Timetable');
const User = require('../models/User');

// @desc    Add a new class to the timetable
// @route   POST /api/timetable
// @access  Private (Admin Only)
const addTimetableEntry = async (req, res) => {
  // 1. Get all data from the request body
  const {
    dayOfWeek,
    startTime,
    endTime,
    subject,
    subjectCode,
    facultyUserId, // We'll get the faculty's university ID (e.g., "F1001")
    classroom,
    department,
    semester,
    section,
  } = req.body;

  // 2. Simple Validation
  if (
    !dayOfWeek ||
    !startTime ||
    !endTime ||
    !subject ||
    !subjectCode ||
    !facultyUserId ||
    !classroom ||
    !department ||
    !semester ||
    !section
  ) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    // 3. Find the faculty's database ID (_id) from their university ID (userId)
    const faculty = await User.findOne({ userId: facultyUserId, role: 'faculty' });

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found with that ID' });
    }

    // 4. Create the new timetable entry
    const newEntry = new Timetable({
      dayOfWeek,
      startTime,
      endTime,
      subject,
      subjectCode,
      faculty: faculty._id, // Use the faculty's MongoDB _id
      classroom,
      department,
      semester,
      section,
    });

    // 5. Save to database
    const createdEntry = await newEntry.save();
    res.status(201).json(createdEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get the logged-in user's timetable
// @route   GET /api/timetable/my
// @access  Private (Students & Faculty)
const getMyTimetable = async (req, res) => {
  try {
    // req.user is available because of our 'protect' middleware
    const user = req.user;

    let timetableEntries;

    if (user.role === 'student') {
      // Find timetable for the student's specific dept, sem, and section
      timetableEntries = await Timetable.find({
        department: user.department,
        semester: user.semester,
        section: user.section,
      }).populate('faculty', 'name'); // Show faculty name
    
    } else if (user.role === 'faculty') {
      // Find all classes assigned to this faculty member
      timetableEntries = await Timetable.find({
        faculty: user._id,
      }).populate('faculty', 'name');
    
    } else {
      // Admins can see the whole timetable
      timetableEntries = await Timetable.find({}).populate('faculty', 'name');
    }

    if (!timetableEntries) {
      return res.status(404).json({ message: 'No timetable found' });
    }

    res.status(200).json(timetableEntries);
  } catch (error) { // <-- THE FIX IS HERE: Added {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// Make sure both functions are exported
module.exports = {
  addTimetableEntry,
  getMyTimetable,
};