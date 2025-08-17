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
    // XP and Leveling
    xp: {
        // XP progress within the current level
        type: Number,
        default: 0,
        min: 0
    },
    level: {
        type: Number,
        default: 1,
        min: 1
    },
    totalXp: {
        // lifetime XP earned
        type: Number,
        default: 0,
        min: 0
    },
    totalRewardsRedeemed: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
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

/**
 * XP & Leveling helpers
 * Requirement curve: XP required for level L is baseXP * (growthFactor)^(L-1)
 * This creates a rapidly increasing requirement as level grows.
 */
// Base XP for level 1
const BASE_XP = 100;
// Growth factor per level (1.5 = 50% more XP required each level). Adjust to taste.
const GROWTH_FACTOR = 1.5;

// Static-like helper available via model: User.xpForLevel(level)
UserSchema.statics.xpForLevel = function(level) {
    const lvl = Math.max(1, Math.floor(level));
    return Math.floor(BASE_XP * Math.pow(GROWTH_FACTOR, lvl - 1));
};

// Instance: XP required to reach next level from current level
UserSchema.methods.xpToNext = function() {
    return this.constructor.xpForLevel(this.level) - this.xp;
};

// Instance: add XP, handle leveling and persist the user document
// Returns an object with details about XP and leveling
UserSchema.methods.addXp = async function(amount) {
    const gained = Math.max(0, Math.floor(amount || 0));
    if (gained === 0) {
        return {
            leveledUp: false,
            level: this.level,
            xp: this.xp,
            xpToNext: this.xpToNext(),
            totalXp: this.totalXp
        };
    }

    this.totalXp = (this.totalXp || 0) + gained;
    this.xp = (this.xp || 0) + gained;

    let leveled = false;
    // loop in case gained XP bumps multiple levels
    while (this.xp >= this.constructor.xpForLevel(this.level)) {
        const req = this.constructor.xpForLevel(this.level);
        this.xp = this.xp - req;
        this.level = (this.level || 1) + 1;
        leveled = true;
    }

    await this.save();

    return {
        leveledUp: leveled,
        level: this.level,
        xp: this.xp,
        xpToNext: this.xpToNext(),
        totalXp: this.totalXp
    };
};

module.exports = mongoose.model('User', UserSchema);
