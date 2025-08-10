const Habit = require('../models/Habit');
const Category = require('../models/Category');

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

        // Update user points if needed and get new value
        if (pointsDelta !== 0) {
            const userDoc = await User.findByIdAndUpdate(req.user.id, {
                $inc: { 
                    points: pointsDelta,
                    totalTasksCompleted: pointsDelta > 0 ? 1 : 0
                }
            }, { new: true });
            userPoints = userDoc.points;
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
