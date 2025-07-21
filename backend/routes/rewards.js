const express = require('express');
const {
    getRewards,
    getReward,
    createReward,
    updateReward,
    deleteReward,
    redeemReward,
    getAvailableRewards,
    getRewardStats
} = require('../controllers/rewards');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getRewards)
    .post(createReward);

router
    .route('/available')
    .get(getAvailableRewards);

router
    .route('/stats')
    .get(getRewardStats);

router
    .route('/:id')
    .get(getReward)
    .put(updateReward)
    .delete(deleteReward);

router
    .route('/:id/redeem')
    .put(redeemReward);

module.exports = router;
