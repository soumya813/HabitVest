/**
 * Migration script to mark existing users as having completed onboarding
 * This prevents existing users from being forced through onboarding process
 * Run this script once after deploying the onboarding feature
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './config/config.env' });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const markExistingUsersAsOnboarded = async () => {
  try {
    await connectDB();
    
    const User = require('../models/User');
    
    // Find users who don't have onboardingCompleted set (or it's false)
    // and were created before a certain date (when onboarding was added)
    const onboardingFeatureDate = new Date('2025-01-01'); // Adjust this date as needed
    
    const result = await User.updateMany(
      {
        createdAt: { $lt: onboardingFeatureDate },
        $or: [
          { onboardingCompleted: { $exists: false } },
          { onboardingCompleted: false }
        ]
      },
      {
        $set: {
          onboardingCompleted: true,
          onboardingCompletedAt: new Date()
        }
      }
    );
    
    console.log(`Migration completed: ${result.modifiedCount} existing users marked as onboarded`);
    console.log('These users will no longer be forced through the onboarding process');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
markExistingUsersAsOnboarded();
