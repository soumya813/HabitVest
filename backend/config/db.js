const mongoose = require('mongoose');

const connectDB = async () => {
    // Validate MONGO_URI
    if (
        !process.env.MONGO_URI ||
        process.env.MONGO_URI.includes('your_mongodb_connection_string_here') ||
        process.env.MONGO_URI.includes('<db_password>')
    ) {
        console.error('❌ ERROR: Invalid or placeholder MONGO_URI.');
        console.error('Please set a valid MongoDB connection string in backend/config/config.env');
        process.exit(1);
    }

    try {
        // Set mongoose options
        mongoose.set('strictQuery', false);
        
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4 // Use IPv4, skip trying IPv6
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        
        // If it's an SSL error, suggest solutions
        if (error.message.includes('SSL') || error.message.includes('TLS')) {
            console.error('SSL/TLS Error detected. This might be due to:');
            console.error('1. Network firewall blocking the connection');
            console.error('2. MongoDB Atlas IP whitelist restrictions');
            console.error('3. Local SSL/TLS configuration issues');
            console.error('Try updating your MongoDB Atlas cluster or check your network settings.');
        }
        
        process.exit(1);
    }
};

module.exports = connectDB;
