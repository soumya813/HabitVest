const Task = require('../models/Task');
const User = require('../models/User');
const mongoose = require('mongoose');

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

        // Add filtering by completion status
        if (req.query.completed !== undefined) {
            query = query.find({ completed: req.query.completed });
        }

        // Add filtering by priority
        if (req.query.priority) {
            query = query.find({ priority: req.query.priority });
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

        const tasks = await query.populate({
            path: 'user',
            select: 'username'
        }).populate({
            path: 'habit',
            select: 'name'
        });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (err) {
        res.status(400).json({ 
            success: false,
            error: err.message 
        });
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
            return res.status(404).json({ 
                success: false,
                error: 'Task not found' 
            });
        }

        // If task is being completed, award points and update completedAt
        if (req.body.completed === true && !task.completed) {
            req.body.completedAt = new Date();
            
            // Award points and XP to user
            const user = await User.findById(task.user);
            if (user) {
                user.points += task.points || 10;
                user.totalTasksCompleted += 1;

                // XP multiplier: task.points * 10 (matches habits logic)
                const xpAmount = Math.max(0, Math.floor((task.points || 10) * 10));
                // set points/totalTasksCompleted before calling addXp so save() persists both
                user.points = user.points;
                user.totalTasksCompleted = user.totalTasksCompleted;
                const xpResult = await user.addXp(xpAmount);
                // attach for potential use later
                res.locals.xpResult = xpResult;
            }
        }

        // If task is being uncompleted, remove points and completedAt
        if (req.body.completed === false && task.completed) {
            req.body.completedAt = null;
            
            // Remove points from user (do not remove XP/levels)
            const user = await User.findById(task.user);
            if (user) {
                user.points = Math.max(0, user.points - (task.points || 10));
                user.totalTasksCompleted = Math.max(0, user.totalTasksCompleted - 1);
                await user.save();
            }
        }

        task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate({
            path: 'user',
            select: 'username points'
        }).populate({
            path: 'habit',
            select: 'name'
        });

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (err) {
        res.status(400).json({ 
            success: false,
            error: err.message 
        });
    }
};

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ 
                success: false,
                error: 'Task not found' 
            });
        }

        await task.remove();

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

// @desc    Complete task and award points
// @route   PUT /api/v1/tasks/:id/complete
// @access  Private
exports.completeTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ 
                success: false,
                error: 'Task not found' 
            });
        }

        if (task.completed) {
            return res.status(400).json({ 
                success: false,
                error: 'Task is already completed' 
            });
        }

        // Mark task as completed
        task.completed = true;
        task.completedAt = new Date();
        await task.save();

        // Award points and XP to user
        const user = await User.findById(task.user);
        let xpResult = null;
        if (user) {
            user.points += task.points || 10;
            user.totalTasksCompleted += 1;
            const xpAmount = Math.max(0, Math.floor((task.points || 10) * 10));
            xpResult = await user.addXp(xpAmount);
        }

        const updatedTask = await Task.findById(req.params.id)
            .populate({
                path: 'user',
                select: 'username points totalTasksCompleted'
            })
            .populate({
                path: 'habit',
                select: 'name'
            });

        res.status(200).json({
            success: true,
            data: updatedTask,
            message: `Task completed! You earned ${task.points || 10} points.`,
            xp: xpResult
        });
    } catch (err) {
        res.status(400).json({ 
            success: false,
            error: err.message 
        });
    }
};

// @desc    Get user task statistics
// @route   GET /api/v1/users/:userId/tasks/stats
// @access  Public
exports.getTaskStats = async (req, res, next) => {
    try {
        const userId = req.params.userId;

        const stats = await Task.aggregate([
            {
                $match: { user: mongoose.Types.ObjectId(userId) }
            },
            {
                $group: {
                    _id: null,
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
                    },
                    pendingTasks: {
                        $sum: { $cond: [{ $eq: ['$completed', false] }, 1, 0] }
                    },
                    totalPoints: {
                        $sum: { $cond: [{ $eq: ['$completed', true] }, '$points', 0] }
                    },
                    highPriorityTasks: {
                        $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
                    },
                    mediumPriorityTasks: {
                        $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] }
                    },
                    lowPriorityTasks: {
                        $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] }
                    }
                }
            }
        ]);

        const result = stats.length > 0 ? stats[0] : {
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            totalPoints: 0,
            highPriorityTasks: 0,
            mediumPriorityTasks: 0,
            lowPriorityTasks: 0
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
