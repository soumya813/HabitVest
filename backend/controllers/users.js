const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Public
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Public
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Create new user
// @route   POST /api/v1/users
// @access  Private
exports.createUser = async (req, res, next) => {
    try {
        const user = await User.create(req.body);

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private
exports.updateUser = async (req, res, next) => {
    try {
        // Check if user is trying to update their own profile
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ 
                success: false, 
                msg: 'Not authorized to update this profile' 
            });
        }

    // Only allow updating certain fields
    const allowedFields = ['username', 'email', 'notifications'];
    const updateData = {};
        
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                if (field === 'notifications' && typeof req.body.notifications === 'object') {
                    // Merge notifications instead of replacing whole object
                    updateData['notifications'] = {
                        ...(req.user.notifications?.toObject ? req.user.notifications.toObject() : req.user.notifications || {}),
                        ...req.body.notifications
                    };
                } else {
                    updateData[field] = req.body[field];
                }
            }
        });

        const user = await User.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                msg: 'User not found' 
            });
        }

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                points: user.points || 0,
                totalTasksCompleted: user.totalTasksCompleted || 0,
                totalRewardsRedeemed: user.totalRewardsRedeemed || 0,
                createdAt: user.createdAt,
                notifications: user.notifications || {
                    habitReminders: true,
                    achievementAlerts: true,
                    weeklySummary: true
                }
            }
        });
    } catch (err) {
        console.error('Update user error:', err);
        res.status(400).json({ 
            success: false, 
            msg: 'Failed to update user profile' 
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};
