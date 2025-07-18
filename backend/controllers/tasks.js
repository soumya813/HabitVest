const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get all tasks
// @route   GET /api/v1/tasks
// @route   GET /api/v1/users/:userId/tasks
// @access  Public
exports.getTasks = async (req, res, next) => {
    try {
        let query;

        if (req.params.userId) {
            query = Task.find({ user: req.params.userId });
        } else {
            query = Task.find();
        }

        const tasks = await query;

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Public
exports.getTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id).populate({
            path: 'user',
            select: 'username'
        });

        if (!task) {
            return res.status(404).json({ success: false });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Create new task
// @route   POST /api/v1/users/:userId/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
    try {
        req.body.user = req.params.userId;

        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ success: false });
        }

        const task = await Task.create(req.body);

        res.status(201).json({
            success: true,
            data: task
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false });
        }

        task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false });
        }

        await task.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};
