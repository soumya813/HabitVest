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

// @desc    Complete user onboarding
// @route   POST /api/v1/users/onboarding
// @access  Private
exports.completeOnboarding = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { goals, schedule, initialHabits, preferences } = req.body;
        // Create initial habits first (validate categories and ensure correct shape)
        let createdHabitsCount = 0;
        if (initialHabits && initialHabits.length > 0) {
            const Habit = require('../models/Habit');
            const Category = require('../models/Category');

            const habitsToCreate = [];
            for (const h of initialHabits) {
                // Validate category id exists (if provided)
                if (h.category) {
                    const cat = await Category.findById(h.category);
                    if (!cat) {
                        return res.status(404).json({ success: false, msg: `Category not found: ${h.category}` });
                    }
                }

                // Ensure frequency has a numeric target (support count alias)
                const freq = h.frequency || { type: 'daily' };
                const normalizedFrequency = {
                    type: freq.type || 'daily',
                    target: (typeof freq.target === 'number' ? freq.target : (typeof freq.count === 'number' ? freq.count : 1)),
                    days: Array.isArray(freq.days) ? freq.days : undefined
                };

                habitsToCreate.push({
                    name: h.name || h.title || 'New Habit',
                    description: h.description || '',
                    category: h.category || null,
                    points: typeof h.points === 'number' ? h.points : 10,
                    frequency: normalizedFrequency,
                    userId: userId,
                    createdAt: new Date(),
                    isActive: h.isActive !== undefined ? h.isActive : true,
                    streak: { current: 0, longest: 0 }
                });
            }

            if (habitsToCreate.length > 0) {
                const inserted = await Habit.insertMany(habitsToCreate);
                createdHabitsCount = Array.isArray(inserted) ? inserted.length : 0;
                console.log('Onboarding - created habits:', createdHabitsCount, (Array.isArray(inserted) ? inserted.map(i => i._id) : inserted));
            }
        }

        // Now update user with onboarding data and mark as completed
        const user = await User.findByIdAndUpdate(
            userId,
            {
                goals,
                schedule,
                preferences,
                onboardingCompleted: true,
                onboardingCompletedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                msg: 'User not found' 
            });
        }

        res.status(200).json({
            success: true,
            msg: 'Onboarding completed successfully',
            data: {
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    onboardingCompleted: user.onboardingCompleted,
                    goals: user.goals,
                    preferences: user.preferences
                },
                habitsCreated: createdHabitsCount
            }
        });
    } catch (err) {
        console.error('Onboarding completion error:', err);
        res.status(400).json({ 
            success: false, 
            msg: 'Failed to complete onboarding',
            error: err.message 
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
