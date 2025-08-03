const express = require('express');
const {
    getHabits,
    getHabit,
    createHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    getHabitStats
} = require('../controllers/habits');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router
    .route('/')
    .get(getHabits)
    .post(createHabit);

router
    .route('/:id')
    .get(getHabit)
    .put(updateHabit)
    .delete(deleteHabit);

router
    .route('/:id/complete')
    .post(completeHabit);

router
    .route('/:id/stats')
    .get(getHabitStats);

module.exports = router;
