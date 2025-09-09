const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: true,
        trim: true,
        maxlength: [50, 'Username can not be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    points: {
        type: Number,
        default: 0,
        min: 0
    },
    totalTasksCompleted: {
        type: Number,
        default: 0
    },
    totalRewardsRedeemed: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // User preferences/settings
    notifications: {
        habitReminders: {
            type: Boolean,
            default: true
        },
        achievementAlerts: {
            type: Boolean,
            default: true
        },
        weeklySummary: {
            type: Boolean,
            default: true
        }
    },
    pushSubscriptions: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
    // Onboarding data
    onboardingCompleted: {
        type: Boolean,
        default: false
    },
    onboardingCompletedAt: {
        type: Date
    },
    goals: {
        type: [String],
        default: []
    },
    schedule: {
        wakeUpTime: String,
        workoutTime: String,
        studyTime: String,
        bedTime: String,
        reminderPreferences: {
            morning: {
                type: Boolean,
                default: true
            },
            evening: {
                type: Boolean,
                default: true
            },
            beforeDeadlines: {
                type: Boolean,
                default: true
            }
        }
    },
    preferences: {
        difficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner'
        },
        focusAreas: {
            type: [String],
            default: []
        },
        motivationStyle: {
            type: String,
            enum: ['competitive', 'collaborative', 'personal'],
            default: 'personal'
        }
    }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
