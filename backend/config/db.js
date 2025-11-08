// backend/config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // We get the MONGO_URI from our .env file
    const conn = await mongoose.connect(process.env.MONGO_URI); // <-- Just this

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;