const Habit = require('../models/Habit');

// @desc    Get all habits
// @route   GET /api/v1/habits
// @access  Public
exports.getHabits = async (req, res, next) => {
    try {
        const habits = await Habit.find();

        res.status(200).json({
            success: true,
            count: habits.length,
            data: habits
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Get single habit
// @route   GET /api/v1/habits/:id
// @access  Public
exports.getHabit = async (req, res, next) => {
    try {
        const habit = await Habit.findById(req.params.id);

        if (!habit) {
            return res.status(404).json({ success: false });
        }

        res.status(200).json({
            success: true,
            data: habit
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Create new habit
// @route   POST /api/v1/habits
// @access  Private
exports.createHabit = async (req, res, next) => {
    try {
        const habit = await Habit.create(req.body);

        res.status(201).json({
            success: true,
            data: habit
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Update habit
// @route   PUT /api/v1/habits/:id
// @access  Private
exports.updateHabit = async (req, res, next) => {
    try {
        const habit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!habit) {
            return res.status(404).json({ success: false });
        }

        res.status(200).json({
            success: true,
            data: habit
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Delete habit
// @route   DELETE /api/v1/habits/:id
// @access  Private
exports.deleteHabit = async (req, res, next) => {
    try {
        const habit = await Habit.findByIdAndDelete(req.params.id);

        if (!habit) {
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
