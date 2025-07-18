const express = require('express');
const {
    getRewards,
    getReward,
    createReward,
    updateReward,
    deleteReward
} = require('../controllers/rewards');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getRewards)
    .post(createReward);

router
    .route('/:id')
    .get(getReward)
    .put(updateReward)
    .delete(deleteReward);

module.exports = router;
