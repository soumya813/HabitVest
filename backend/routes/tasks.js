const express = require('express');
const {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    getTaskStats
} = require('../controllers/tasks');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getTasks)
    .post(createTask);

router
    .route('/stats')
    .get(getTaskStats);

router
    .route('/:id')
    .get(getTask)
    .put(updateTask)
    .delete(deleteTask);

router
    .route('/:id/complete')
    .put(completeTask);

module.exports = router;
