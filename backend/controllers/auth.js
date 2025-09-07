const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Debug: log incoming registration payload (without password in logs)
        try {
            const safeBody = { ...req.body };
            if (safeBody.password) safeBody.password = '***REDACTED***';
            console.log('Register payload:', safeBody);
        } catch (e) {
            // ignore
        }

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, msg: 'Please provide username, email and password' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, msg: 'User already exists with this email' });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password
        });

        // Create default categories for the new user
        try {
            const Category = require('../models/Category');
            await Category.createDefaultCategories(user._id);
            console.log('Default categories created for user:', user._id);
        } catch (categoryError) {
            console.error('Error creating default categories:', categoryError);
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error('Registration error:', err);
        // Provide more detailed error messages in development to help debugging
        if (process.env.NODE_ENV === 'development') {
            // If Mongoose validation error, include messages
            let message = 'Registration failed. Please try again.';
            try {
                if (err.name === 'ValidationError') {
                    // collect messages
                    message = Object.values(err.errors).map(e => e.message).join(' | ');
                } else if (err.message) {
                    message = err.message;
                }
            } catch (parseErr) {
                // fallback
            }
            return res.status(400).json({ success: false, msg: message });
        }

        res.status(400).json({ success: false, msg: 'Registration failed. Please try again.' });
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, msg: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, msg: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, msg: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error('Login error:', err);
        res.status(400).json({ success: false, msg: 'Login failed. Please try again.' });
    }
};

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: 'User logged out'
    });
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        // Include XP/level summary for frontend convenience
        const xpSummary = {
            xp: user.xp || 0,
            level: user.level || 1,
            totalXp: user.totalXp || 0,
            xpToNext: typeof user.xpToNext === 'function' ? user.xpToNext() : undefined
        };

        res.status(200).json({
            success: true,
            data: {
                ...user.toObject(),
                xp: xpSummary.xp,
                level: xpSummary.level,
                totalXp: xpSummary.totalXp,
                xpToNext: xpSummary.xpToNext,
                notifications: user.notifications || {
                    habitReminders: true,
                    achievementAlerts: true,
                    weeklySummary: true
                }
            }
        });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(400).json({ success: false, msg: 'Could not get user information' });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();


    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        secure: process.env.NODE_ENV === 'production', // Only secure in production
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
    };

    // Debug log for cookie options
    console.log('Setting auth cookie with options:', options);

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                points: user.points || 0,
                totalTasksCompleted: user.totalTasksCompleted || 0,
                totalRewardsRedeemed: user.totalRewardsRedeemed || 0
            }
        });
};
