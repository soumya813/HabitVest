const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        trim: true,
        maxlength: [30, 'Category name cannot exceed 30 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    color: {
        type: String,
        default: '#3B82F6', // Default blue color
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color']
    },
    icon: {
        type: String,
        default: 'target', // Default lucide icon name
        maxlength: [20, 'Icon name cannot exceed 20 characters']
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    habitCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate category names for the same user
CategorySchema.index({ name: 1, userId: 1 }, { unique: true });

// Update the updatedAt field before saving
CategorySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to create default categories for new users
CategorySchema.statics.createDefaultCategories = async function(userId) {
    const defaultCategories = [
        { name: 'Health', icon: 'heart', color: '#EF4444', description: 'Physical and mental wellness' },
        { name: 'Work', icon: 'briefcase', color: '#3B82F6', description: 'Professional development' },
        { name: 'Finance', icon: 'dollar-sign', color: '#10B981', description: 'Money and investment goals' },
        { name: 'Education', icon: 'book', color: '#8B5CF6', description: 'Learning and skill development' },
        { name: 'Personal', icon: 'user', color: '#F59E0B', description: 'Personal growth and hobbies' },
        { name: 'Social', icon: 'users', color: '#EC4899', description: 'Relationships and social activities' }
    ];

    const categories = defaultCategories.map(cat => ({
        ...cat,
        userId,
        isDefault: true
    }));

    return await this.insertMany(categories);
};

module.exports = mongoose.model('Category', CategorySchema);
