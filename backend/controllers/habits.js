const Habit = require('../models/Habit');
const Category = require('../models/Category');

// @desc    Get all habits for authenticated user
// @route   GET /api/v1/habits
// @access  Private
exports.getHabits = async (req, res, next) => {
    try {
        // Get query parameters for filtering
        const { category, active } = req.query;
        
        // Build query
        let query = { userId: req.user.id };
        
        if (category) {
            query.category = category;
        }
        
        if (active !== undefined) {
            query.isActive = active === 'true';
        }

        const habits = await Habit.find(query).sort({ createdAt: -1 });

        // Add today's completion status for each habit
        const habitsWithStatus = habits.map(habit => {
            const habitObj = habit.toObject();
            habitObj.shouldCompleteToday = habit.shouldCompleteToday();
            habitObj.remainingForPeriod = habit.getRemainingForPeriod();
            
            // Check if completed today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayCompletion = habit.completions.find(completion => {
                const completionDate = new Date(completion.date);
                completionDate.setHours(0, 0, 0, 0);
                return completionDate.getTime() === today.getTime() && completion.completed;
            });
            habitObj.completedToday = !!todayCompletion;
            
            return habitObj;
        });

        res.status(200).json({
            success: true,
            count: habitsWithStatus.length,
            data: habitsWithStatus
        });
    } catch (err) {
        console.error('Get habits error:', err);
        res.status(400).json({ 
            success: false, 
            msg: 'Failed to fetch habits' 
        });
    }
};

// @desc    Get single habit
// @route   GET /api/v1/habits/:id
// @access  Private
exports.getHabit = async (req, res, next) => {
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

        const habitObj = habit.toObject();
        habitObj.shouldCompleteToday = habit.shouldCompleteToday();
        habitObj.remainingForPeriod = habit.getRemainingForPeriod();

        res.status(200).json({
            success: true,
            data: habitObj
        });
    } catch (err) {
        console.error('Get habit error:', err);
        res.status(400).json({ 
            success: false, 
            msg: 'Failed to fetch habit' 
        });
    }
};

// @desc    Create new habit
// @route   POST /api/v1/habits
// @access  Private
exports.createHabit = async (req, res, next) => {
    try {
        // Add user ID to request body
        req.body.userId = req.user.id;
        
        // Validate category exists
        if (req.body.category) {
            const categoryExists = await Category.findOne({
                _id: req.body.category,
                userId: req.user.id
            });
            
            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    msg: 'Category does not exist'
                });
            }
        }

        const habit = await Habit.create(req.body);

        res.status(201).json({
            success: true,
            data: habit
        });
    } catch (err) {
        console.error('Create habit error:', err);
        res.status(400).json({ 
            success: false, 
            msg: 'Failed to create habit' 
        });
    }
};

// @desc    Update habit
// @route   PUT /api/v1/habits/:id
// @access  Private
exports.updateHabit = async (req, res, next) => {
    try {
        // Find habit and ensure it belongs to the user
        let habit = await Habit.findOne({ 
            _id: req.params.id, 
            userId: req.user.id 
        });

        if (!habit) {
            return res.status(404).json({ 
                success: false, 
                msg: 'Habit not found' 
            });
        }

        // Validate category if being updated
        if (req.body.category) {
            const categoryExists = await Category.findOne({
                name: req.body.category,
                userId: req.user.id
            });
            
            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    msg: 'Category does not exist'
                });
            }
        }

        habit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: habit
        });
    } catch (err) {
        console.error('Update habit error:', err);
        res.status(400).json({ 
            success: false, 
            msg: 'Failed to update habit' 
        });
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

        if (existingCompletion) {
            // Update existing completion
            existingCompletion.completed = completed;
            existingCompletion.notes = notes;
        } else {
            // Add new completion
            habit.completions.push({
                date: today,
                completed,
                notes
            });
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

        // Update user points if completed
        if (completed) {
            const User = require('../models/User');
            await User.findByIdAndUpdate(req.user.id, {
                $inc: { 
                    points: habit.points,
                    totalTasksCompleted: 1
                }
            });
        }

        res.status(200).json({
            success: true,
            data: habit
        });
    } catch (err) {
        console.error('Complete habit error:', err);
        res.status(400).json({ 
            success: false, 
            msg: 'Failed to update habit completion' 
        });
    }
};

// @desc    Delete habit
// @route   DELETE /api/v1/habits/:id
// @access  Private
exports.deleteHabit = async (req, res, next) => {
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

        await Habit.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error('Delete habit error:', err);
        res.status(400).json({ 
            success: false, 
            msg: 'Failed to delete habit' 
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
