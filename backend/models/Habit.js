const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name for the habit'],
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please assign a category']
    },
    points: {
        type: Number,
        default: 10,
        min: [1, 'Points must be at least 1'],
        max: [100, 'Points cannot exceed 100']
    },
    frequency: {
        type: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'specific_days'],
            default: 'daily'
        },
        // For weekly/monthly: how many times per period
        target: {
            type: Number,
            default: 1,
            min: [1, 'Target must be at least 1']
        },
        // For specific_days: which days of the week (0 = Sunday, 1 = Monday, etc.)
        days: {
            type: [Number],
            validate: {
                validator: function(days) {
                    return days.every(day => day >= 0 && day <= 6);
                },
                message: 'Days must be between 0 (Sunday) and 6 (Saturday)'
            }
        }
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // Track completion history
    completions: [{
        date: {
            type: Date,
            default: Date.now
        },
        completed: {
            type: Boolean,
            default: true
        },
        notes: {
            type: String,
            maxlength: [200, 'Notes cannot exceed 200 characters']
        }
    }],
    streak: {
        current: {
            type: Number,
            default: 0
        },
        longest: {
            type: Number,
            default: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
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

// Update the updatedAt field before saving
HabitSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to check if habit should be completed today
HabitSchema.methods.shouldCompleteToday = function() {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    switch(this.frequency.type) {
        case 'daily':
            return true;
        case 'specific_days':
            return this.frequency.days.includes(today);
        case 'weekly':
        case 'monthly':
            // For weekly/monthly, we need to check if target is met
            return this.getRemainingForPeriod() > 0;
        default:
            return false;
    }
};

// Method to get remaining completions for current period
HabitSchema.methods.getRemainingForPeriod = function() {
    const now = new Date();
    let periodStart;
    
    if (this.frequency.type === 'weekly') {
        // Get start of current week (Sunday)
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - now.getDay());
        periodStart.setHours(0, 0, 0, 0);
    } else if (this.frequency.type === 'monthly') {
        // Get start of current month
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
        return 0;
    }
    
    // Count completions in current period
    const completionsInPeriod = this.completions.filter(completion => 
        completion.completed && completion.date >= periodStart
    ).length;
    
    return Math.max(0, this.frequency.target - completionsInPeriod);
};

module.exports = mongoose.model('Habit', HabitSchema);
