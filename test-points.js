const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./backend/models/User');

// Load project env (backend config)
dotenv.config({ path: path.join(__dirname, 'backend', 'config', 'config.env') });

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/habitvest-test';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Create a test user
    // use a valid email to satisfy model validation
    let u = new User({ username: 'points-tester', email: 'points-tester@example.com', password: 'password123' });
    await u.save();
    console.log('Created user', u.username, 'points', u.points);

    // Add points
    u.points = (u.points || 0) + 150;
    await u.save();
    console.log('After +150 points:', { points: u.points });

    u.points = (u.points || 0) + 1000;
    await u.save();
    console.log('After +1000 points:', { points: u.points });

    // cleanup
    await User.deleteOne({ _id: u._id });
    await mongoose.disconnect();
    console.log('Done and cleaned up');
  } catch (err) {
    console.error('Test script error:', err.message || err);
  }
}

run();
