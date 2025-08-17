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
  let u = new User({ username: 'xp-tester', email: 'xp-tester@example.com', password: 'password123' });
    await u.save();
    console.log('Created user', u.username, 'level', u.level, 'xp', u.xp);

    // Add XP
    const res1 = await u.addXp(150);
    console.log('After +150 XP:', res1);

    const res2 = await u.addXp(1000);
    console.log('After +1000 XP:', res2);

    // cleanup
    await User.deleteOne({ _id: u._id });
    await mongoose.disconnect();
    console.log('Done and cleaned up');
  } catch (err) {
    console.error('Test script error:', err.message || err);
  }
}

run();
