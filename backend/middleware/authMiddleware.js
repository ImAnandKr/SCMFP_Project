const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes that require a user to be logged in
const protect = async (req, res, next) => {
  let token;

  // 1. Check if the 'Authorization' header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Get the token from the header (format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token using our JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user from the ID in the token
      //    We attach the user object to the 'req' object, excluding the password
      req.user = await User.findById(decoded.id).select('-password');

      // 5. Move to the next function (the actual controller)
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check if the user is an Admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // User is an admin, proceed
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};
const isFaculty = (req, res, next) => {
  if (req.user && req.user.role === 'faculty') {
    next(); // User is faculty, proceed
  } else {
    res.status(401).json({ message: 'Not authorized as faculty' });
  }
};
// Middleware to check if the user is a Student
const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next(); // User is student, proceed
  } else {
    res.status(401).json({ message: 'Not authorized as student' });
  }
};

module.exports = { protect, isAdmin, isFaculty, isStudent };