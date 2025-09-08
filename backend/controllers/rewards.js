const Reward = require('../models/Reward');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get all rewards
// @route   GET /api/v1/rewards
// @route   GET /api/v1/users/:userId/rewards
// @access  Public
exports.getRewards = async (req, res, next) => {
    try {
        let query;

        if (req.params.userId) {
            query = Reward.find({ user: req.params.userId });
        } else {
            query = Reward.find();
        }

        // Add filtering by redemption status
        if (req.query.isRedeemed !== undefined) {
            query = query.find({ isRedeemed: req.query.isRedeemed });
        }

        // Add filtering by availability
        if (req.query.isAvailable !== undefined) {
            query = query.find({ isAvailable: req.query.isAvailable });
        }

        // Add filtering by type
        if (req.query.type) {
            query = query.find({ type: req.query.type });
        }

        // Add filtering by category
        if (req.query.category) {
            query = query.find({ category: req.query.category });
        }

        // Add sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        const rewards = await query.populate({
            path: 'user',
            select: 'username points'
        });

        res.status(200).json({
            success: true,
            count: rewards.length,
            data: rewards
        });
    } catch (err) {
        res.status(400).json({ 
            success: false,
            error: err.message 
        });
    }
};

// @desc    Get single reward
// @route   GET /api/v1/rewards/:id
// @access  Public
exports.getReward = async (req, res, next) => {
    try {
        const reward = await Reward.findById(req.params.id).populate({
            path: 'user',
            select: 'username'
        });

        if (!reward) {
            return res.status(404).json({ success: false });
        }

        res.status(200).json({
            success: true,
            data: reward
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Create new reward
// @route   POST /api/v1/users/:userId/rewards
// @access  Private
exports.createReward = async (req, res, next) => {
    try {
        req.body.user = req.params.userId;

        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ success: false });
        }

        const reward = await Reward.create(req.body);

        res.status(201).json({
            success: true,
            data: reward
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Update reward
// @route   PUT /api/v1/rewards/:id
// @access  Private
exports.updateReward = async (req, res, next) => {
    try {
        let reward = await Reward.findById(req.params.id);

        if (!reward) {
            return res.status(404).json({ success: false });
        }

        reward = await Reward.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: reward
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Delete reward
// @route   DELETE /api/v1/rewards/:id
// @access  Private
exports.deleteReward = async (req, res, next) => {
    try {
        const reward = await Reward.findById(req.params.id);

        if (!reward) {
            return res.status(404).json({ 
                success: false,
                error: 'Reward not found' 
            });
        }

        await reward.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ 
            success: false,
            error: err.message 
        });
    }
};

// @desc    Redeem reward
// @route   PUT /api/v1/rewards/:id/redeem
// @access  Private
exports.redeemReward = async (req, res, next) => {
    try {
        const reward = await Reward.findById(req.params.id);

        if (!reward) {
            return res.status(404).json({ 
                success: false,
                error: 'Reward not found' 
            });
        }

        if (reward.isRedeemed) {
            return res.status(400).json({ 
                success: false,
                error: 'Reward has already been redeemed' 
            });
        }

        if (!reward.isAvailable) {
            return res.status(400).json({ 
                success: false,
                error: 'Reward is not available' 
            });
        }

        // Check if user has enough points
        const user = await User.findById(reward.user);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        if (user.points < reward.points) {
            return res.status(400).json({ 
                success: false,
                error: `Insufficient points. You need ${reward.points} points but only have ${user.points} points.` 
            });
        }

        // Redeem the reward
        reward.isRedeemed = true;
        reward.redeemedAt = new Date();
        await reward.save();

        // Deduct points from user
        user.points -= reward.points;
        user.totalRewardsRedeemed += 1;
        await user.save();

        const updatedReward = await Reward.findById(req.params.id)
            .populate({
                path: 'user',
                select: 'username points totalRewardsRedeemed'
            });

        res.status(200).json({
            success: true,
            data: updatedReward,
            message: `Reward redeemed successfully! ${reward.points} points deducted.`
        });
    } catch (err) {
        res.status(400).json({ 
            success: false,
            error: err.message 
        });
    }
};

// @desc    Get available rewards for user
// @route   GET /api/v1/users/:userId/rewards/available
// @access  Public
exports.getAvailableRewards = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        const rewards = await Reward.find({
            user: userId,
            isAvailable: true,
            isRedeemed: false
        }).sort('points');

        // Add affordability information
        const rewardsWithAffordability = rewards.map(reward => ({
            ...reward.toObject(),
            canAfford: user.points >= reward.points,
            pointsNeeded: Math.max(0, reward.points - user.points)
        }));

        res.status(200).json({
            success: true,
            count: rewardsWithAffordability.length,
            userPoints: user.points,
            data: rewardsWithAffordability
        });
    } catch (err) {
        res.status(400).json({ 
            success: false,
            error: err.message 
        });
    }
};

// @desc    Get user reward statistics
// @route   GET /api/v1/users/:userId/rewards/stats
// @access  Public
exports.getRewardStats = async (req, res, next) => {
    try {
        const userId = req.params.userId;

        const stats = await Reward.aggregate([
            {
                $match: { user: mongoose.Types.ObjectId(userId) }
            },
            {
                $group: {
                    _id: null,
                    totalRewards: { $sum: 1 },
                    redeemedRewards: {
                        $sum: { $cond: [{ $eq: ['$isRedeemed', true] }, 1, 0] }
                    },
                    availableRewards: {
                        $sum: { $cond: [{ $and: [{ $eq: ['$isRedeemed', false] }, { $eq: ['$isAvailable', true] }] }, 1, 0] }
                    },
                    totalPointsSpent: {
                        $sum: { $cond: [{ $eq: ['$isRedeemed', true] }, '$points', 0] }
                    },
                    virtualRewards: {
                        $sum: { $cond: [{ $eq: ['$type', 'virtual'] }, 1, 0] }
                    },
                    physicalRewards: {
                        $sum: { $cond: [{ $eq: ['$type', 'physical'] }, 1, 0] }
                    },
                    experienceRewards: {
                        $sum: { $cond: [{ $eq: ['$type', 'experience'] }, 1, 0] }
                    }
                }
            }
        ]);

        const result = stats.length > 0 ? stats[0] : {
            totalRewards: 0,
            redeemedRewards: 0,
            availableRewards: 0,
            totalPointsSpent: 0,
            virtualRewards: 0,
            physicalRewards: 0,
            experienceRewards: 0
        };

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        res.status(400).json({ 
            success: false,
            error: err.message 
        });
    }
};
