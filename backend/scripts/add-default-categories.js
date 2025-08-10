// Script to add default categories for all users
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');

dotenv.config({ path: './config/config.env' });

const defaultCategories = [
  { name: 'Health', description: 'Habits for physical and mental well-being', color: '#34D399', icon: 'heart', isDefault: true },
  { name: 'Productivity', description: 'Habits to boost productivity', color: '#F59E42', icon: 'check-circle', isDefault: true },
  { name: 'Learning', description: 'Habits for continuous learning', color: '#6366F1', icon: 'book', isDefault: true },
  { name: 'Finance', description: 'Habits for financial growth', color: '#FBBF24', icon: 'dollar-sign', isDefault: true },
  { name: 'Personal', description: 'Personal development habits', color: '#F472B6', icon: 'user', isDefault: true }
];

async function addCategoriesForAllUsers() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find();
  for (const user of users) {
    for (const cat of defaultCategories) {
      const exists = await Category.findOne({ name: cat.name, userId: user._id });
      if (!exists) {
        await Category.create({ ...cat, userId: user._id });
        console.log(`Added category '${cat.name}' for user ${user.username}`);
      }
    }
  }
  await mongoose.disconnect();
  console.log('Done adding categories for all users.');
}

addCategoriesForAllUsers().catch(err => { console.error(err); process.exit(1); });
