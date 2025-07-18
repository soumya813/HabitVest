const Reward = require('../models/Reward');
const User = require('../models/User');

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

        const rewards = await query;

        res.status(200).json({
            success: true,
            count: rewards.length,
            data: rewards
        });
    } catch (err) {
        res.status(400).json({ success: false });
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
            return res.status(404).json({ success: false });
        }

        await reward.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};
