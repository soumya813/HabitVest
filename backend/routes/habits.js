const express = require('express');
const {
    getHabits,
    getHabit,
    createHabit,
    updateHabit,
    deleteHabit
} = require('../controllers/habits');

const router = express.Router();

router
    .route('/')
    .get(getHabits)
    .post(createHabit);

router
    .route('/:id')
    .get(getHabit)
    .put(updateHabit)
    .delete(deleteHabit);

module.exports = router;
