// 1. Import necessary packages
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http'); // <-- 1. Import http
const { Server } = require('socket.io'); // <-- 2. Import socket.io

// 2. LOAD ENVIRONMENT VARIABLES
dotenv.config();

// 3. Import local files
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const classRoutes = require('./routes/classRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// 4. Connect to MongoDB
connectDB();

// 5. Initialize Express app
const app = express();

// 6. Create the HTTP server
const server = http.createServer(app); // <-- 7. Create server from app

// 8. Initialize Socket.io
// We enable CORS for our React app (which will run on localhost:3000)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow your React frontend
    methods: ['GET', 'POST'],
  },
});

// 9. Use Middlewares
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Allow app to accept JSON data

// 10. Mount the API routes
app.use('/api/users', userRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 11. Define Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  // When a user disconnects
  socket.on('disconnect', () => {
    console.log(`Socket Disconnected: ${socket.id}`);
  });
});

// 12. Make the 'io' object available to other files (like our controllers)
// This is a simple way to allow our controllers to emit events
app.set('socketio', io);

// 13. Define the Port
const PORT = process.env.PORT || 5000;

// 14. Start the server
// We use 'server.listen' instead of 'app.listen'
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});