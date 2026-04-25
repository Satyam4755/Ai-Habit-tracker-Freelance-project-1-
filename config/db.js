const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://satyam:satyam4755@satyamdb.mebk6.mongodb.net/HabitTrackerDB?retryWrites=true&w=majority&appName=SatyamDB";

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Atlas properly connected.');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1); 
    }
};

module.exports = connectDB;
