const User = require('../models/User'); // Import User model
const bcrypt = require('bcryptjs'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For creating tokens

// Utility function to generate a token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token will be valid for 30 days
  });
};

// --- REGISTER FUNCTION ---
// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  // 1. Get data from the request body
  const { userId, name, email, password, role, department, semester, section } = req.body;

  // 2. Simple validation: Check for all fields
  if (!userId || !name || !email || !password || !role || !department) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    // 3. Check if user (by email or userId) already exists
    const userExists = await User.findOne({ $or: [{ email }, { userId }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 4. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create the new user in memory
    const user = new User({
      userId,
      name,
      email,
      password: hashedPassword,
      role,
      department,
      semester, // Will be null if role is not 'student'
      section,  // Will be null if role is 'student'
    });

    // 6. Save the user to the database
    await user.save();

    // 7. Send back a successful response with a token
    if (user) {
      // Emit an event so connected frontends can refresh student counts
      try {
        const io = req.app && req.app.get && req.app.get('socketio');
        if (io) {
          io.emit('studentsUpdated', {
            department: user.department,
            semester: user.semester,
            section: user.section,
            userId: user._id,
          });
        }
      } catch (e) {
        console.error('Failed to emit studentsUpdated', e);
      }
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id), // Send a token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// --- LOGIN FUNCTION ---
// @desc    Authenticate a user (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  // 1. Get email and password from request body
  const { email, password } = req.body;

  // 2. Simple validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // 3. Find the user by their email
    const user = await User.findOne({ email });

    // 4. Check if user exists AND if password matches
    if (user && (await bcrypt.compare(password, user.password))) {
      // 5. User is valid! Send back their data and a new token
      res.status(200).json({
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      // 5b. User not found or password didn't match
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};


// Export the functions to be used in our routes
module.exports = {
  registerUser,
  loginUser,
};