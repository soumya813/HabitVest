const Habit = require('../models/Habit');
const Category = require('../models/Category');

// @desc    Get all habits for current user
// @route   GET /api/v1/habits
// @access  Private
exports.getHabits = async (req, res, next) => {
    try {
        let query = Habit.find({ userId: req.user.id });

        // filter by category
        if (req.query.category) {
            query = query.find({ category: req.query.category });
        }

        // filter by active state
        if (req.query.isActive !== undefined) {
            const isActive = req.query.isActive === 'true' || req.query.isActive === true;
            query = query.find({ isActive });
        }

        // sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        const habits = await query.populate({ path: 'category', select: 'name' });

        // Enhance returned habits with frontend-friendly fields
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const enhanced = habits.map(h => {
            const obj = h.toObject({ getters: true });
            obj.completedToday = Array.isArray(obj.completions) && obj.completions.some(c => {
                if (!c || !c.date) return false;
                const d = new Date(c.date);
                d.setHours(0, 0, 0, 0);
                return d.getTime() === today.getTime() && c.completed;
            });
            // try to call model method if available
            try {
                obj.remainingForPeriod = typeof h.getRemainingForPeriod === 'function' ? h.getRemainingForPeriod() : undefined;
            } catch (e) {
                obj.remainingForPeriod = undefined;
            }
            // expose streak as number for older frontend code
            if (obj.streak && typeof obj.streak === 'object') {
                obj.streak = obj.streak.current || 0;
            }
            return obj;
        });

        res.status(200).json({ success: true, count: enhanced.length, data: enhanced });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single habit
// @route   GET /api/v1/habits/:id
// @access  Private
exports.getHabit = async (req, res, next) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id }).populate({ path: 'category', select: 'name' });

        if (!habit) {
            return res.status(404).json({ success: false, msg: 'Habit not found' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const obj = habit.toObject({ getters: true });
        obj.completedToday = Array.isArray(obj.completions) && obj.completions.some(c => {
            if (!c || !c.date) return false;
            const d = new Date(c.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime() && c.completed;
        });
        try {
            obj.remainingForPeriod = typeof habit.getRemainingForPeriod === 'function' ? habit.getRemainingForPeriod() : undefined;
        } catch (e) {
            obj.remainingForPeriod = undefined;
        }
        if (obj.streak && typeof obj.streak === 'object') {
            obj.streak = obj.streak.current || 0;
        }

        res.status(200).json({ success: true, data: obj });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new habit
// @route   POST /api/v1/habits
// @access  Private
exports.createHabit = async (req, res, next) => {
    try {
        req.body.userId = req.user.id;

        // validate category
        if (req.body.category) {
            const cat = await Category.findById(req.body.category);
            if (!cat) {
                return res.status(404).json({ success: false, msg: 'Category not found' });
            }
        }

        const habit = await Habit.create(req.body);

        res.status(201).json({ success: true, data: habit });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update habit
// @route   PUT /api/v1/habits/:id
// @access  Private
exports.updateHabit = async (req, res, next) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });

        if (!habit) {
            return res.status(404).json({ success: false, error: 'Habit not found' });
        }

        // if category being updated, validate
        if (req.body.category) {
            const cat = await Category.findById(req.body.category);
            if (!cat) {
                return res.status(404).json({ success: false, msg: 'Category not found' });
            }
        }

        const updated = await Habit.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate({ path: 'category', select: 'name' });

        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete habit
// @route   DELETE /api/v1/habits/:id
// @access  Private
exports.deleteHabit = async (req, res, next) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });

        if (!habit) {
            return res.status(404).json({ success: false, error: 'Habit not found' });
        }

        await habit.remove();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Complete/uncomplete habit for today
// @route   POST /api/v1/habits/:id/complete
// @access  Private
exports.completeHabit = async (req, res, next) => {
    try {
        const habit = await Habit.findOne({ 
            _id: req.params.id, 
            userId: req.user.id 
        });

        if (!habit) {
            return res.status(404).json({ 
                success: false, 
                msg: 'Habit not found' 
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Check if already completed today
        const existingCompletion = habit.completions.find(completion => {
            const completionDate = new Date(completion.date);
            completionDate.setHours(0, 0, 0, 0);
            return completionDate.getTime() === today.getTime();
        });

        const { completed = true, notes = '' } = req.body;
        let pointsDelta = 0;
        let userPoints = 0;
        const User = require('../models/User');

        if (existingCompletion) {
            // If already completed today, do not add points again
            if (!existingCompletion.completed && completed) {
                // Mark as completed and add points
                existingCompletion.completed = true;
                existingCompletion.notes = notes;
                pointsDelta = habit.points;
            } else if (existingCompletion.completed && !completed) {
                // Unmarking is not allowed by frontend, but if allowed, subtract points
                existingCompletion.completed = false;
                existingCompletion.notes = notes;
                pointsDelta = -habit.points;
            } else {
                // No change
                existingCompletion.notes = notes;
            }
        } else {
            // Add new completion
            habit.completions.push({
                date: today,
                completed,
                notes
            });
            if (completed) {
                pointsDelta = habit.points;
            }
        }

        // Update streak
        if (completed) {
            habit.streak.current += 1;
            if (habit.streak.current > habit.streak.longest) {
                habit.streak.longest = habit.streak.current;
            }
        } else {
            habit.streak.current = 0;
        }

        await habit.save();

        // Update user points if needed
        if (pointsDelta !== 0) {
            const userDoc = await User.findById(req.user.id);
            if (userDoc) {
                userDoc.points = (userDoc.points || 0) + pointsDelta;
                if (pointsDelta > 0) {
                    userDoc.totalTasksCompleted = (userDoc.totalTasksCompleted || 0) + 1;
                }
                await userDoc.save();
                userPoints = userDoc.points;
            } else {
                userPoints = 0;
            }
        } else {
            const userDoc = await User.findById(req.user.id);
            userPoints = userDoc.points;
        }

        res.status(200).json({
            success: true,
            data: habit,
            userPoints
        });
    } catch (err) {
        console.error('Complete habit error:', err);
        res.status(400).json({ 
            success: false, 
            msg: 'Failed to update habit completion' 
        });
    }
};

// @desc    Get habit statistics
// @route   GET /api/v1/habits/:id/stats
// @access  Private
exports.getHabitStats = async (req, res, next) => {
    try {
        const habit = await Habit.findOne({ 
            _id: req.params.id, 
            userId: req.user.id 
        });

        if (!habit) {
            return res.status(404).json({ 
                success: false, 
                msg: 'Habit not found' 
            });
        }

        const completions = habit.completions.filter(c => c.completed);
        const totalDays = Math.ceil((new Date() - habit.createdAt) / (1000 * 60 * 60 * 24));
        const completionRate = totalDays > 0 ? (completions.length / totalDays) * 100 : 0;

        const stats = {
            totalCompletions: completions.length,
            currentStreak: habit.streak.current,
            longestStreak: habit.streak.longest,
            completionRate: Math.round(completionRate * 100) / 100,
            totalPoints: completions.length * habit.points,
            daysActive: totalDays
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error('Get habit stats error:', err);
        res.status(400).json({ 
            success: false, 
            msg: 'Failed to fetch habit statistics' 
        });
    }
};
