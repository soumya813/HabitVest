const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name for the task'],
        trim: true,
        maxlength: [100, 'Name can not be more than 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    dueDate: {
        type: Date
    },
    category: {
        type: String,
        trim: true,
        maxlength: [50, 'Category can not be more than 50 characters']
    },
    points: {
        type: Number,
        default: 10,
        min: [1, 'Points must be at least 1']
    },
    completedAt: {
        type: Date
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    habit: {
        type: mongoose.Schema.ObjectId,
        ref: 'Habit',
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Task', TaskSchema);
