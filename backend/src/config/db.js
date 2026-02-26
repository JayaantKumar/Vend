const mongoose = require('mongoose');

// In modern Mongoose, strictQuery is set globally before connecting
mongoose.set('strictQuery', false); 

const connectDB = async () => {
  try {
    // Connect directly without the deprecated options
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`🌿 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;