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
        console.log('Delete Habit Request:', {
            params: req.params,
            user: req.user ? req.user._id : null
        });
        if (!req.user || !req.user._id) {
            console.error('No authenticated user found');
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });

        if (!habit) {
            console.error('Habit not found for user', req.user._id, 'with id', req.params.id);
            return res.status(404).json({ success: false, error: 'Habit not found' });
        }

        await habit.deleteOne();
        console.log('Habit deleted:', req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error('Error deleting habit:', err);
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
        // Ensure completions is an array (older docs may have it missing)
        if (!Array.isArray(habit.completions)) {
            habit.completions = [];
        }

        // Check if already completed today
        const existingCompletion = habit.completions.find(completion => {
            if (!completion || !completion.date) return false;
            const completionDate = new Date(completion.date);
            completionDate.setHours(0, 0, 0, 0);
            return completionDate.getTime() === today.getTime();
        });

        const requestBody = req.body || {};
        const { completed = true, notes = '' } = requestBody;
        let pointsDelta = 0;
        const User = require('../models/User');

        if (existingCompletion) {
            // If already completed today, update existing record
            if (!existingCompletion.completed && completed) {
                // Mark as completed and add points
                existingCompletion.completed = true;
                existingCompletion.notes = notes;
                pointsDelta = habit.points;
            } else if (existingCompletion.completed && !completed) {
                // Unmarking completion, subtract points
                existingCompletion.completed = false;
                existingCompletion.notes = notes;
                pointsDelta = -habit.points;
            }
        } else if (completed) {
            // If not completed today and request is to complete, create new record and add points
            habit.completions = habit.completions || [];
            habit.completions.push({ date: today, completed: true, notes });
            pointsDelta = habit.points;
        }

        // Update streak (guard if method throws)
        try {
            if (typeof habit.updateStreak === 'function') {
                await habit.updateStreak();
            }
        } catch (stErr) {
            console.error('Error updating streak for habit', habit._id, stErr);
        }

        await habit.save();

        // Update user points if they changed
        if (pointsDelta !== 0) {
            const user = await User.findById(req.user.id);
            user.points += pointsDelta;
            await user.save();
            return res.status(200).json({
                success: true,
                data: habit,
                userPoints: user.points
            });
        }
        
        res.status(200).json({ 
            success: true, 
            data: habit 
        });
    } catch (err) {
        console.error('Complete habit error:', err);
        console.error('Request body:', req.body);
        console.error('Habit id:', req.params.id);
        console.error('User id:', req.user ? req.user.id : 'undefined');
        
        res.status(400).json({ 
            success: false, 
            msg: 'Failed to update habit completion',
            error: err && err.message ? err.message : String(err)
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

        const completions = Array.isArray(habit.completions) ? habit.completions.filter(c => c && c.completed) : [];
        const totalDays = Math.ceil((new Date() - (habit.createdAt || new Date())) / (1000 * 60 * 60 * 24));
        const completionRate = totalDays > 0 ? (completions.length / totalDays) * 100 : 0;

        const stats = {
            totalCompletions: completions.length,
            currentStreak: habit.streak ? (habit.streak.current || 0) : 0,
            longestStreak: habit.streak ? (habit.streak.longest || 0) : 0,
            completionRate: Math.round(completionRate * 100) / 100,
            totalPoints: completions.length * (habit.points || 0),
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
