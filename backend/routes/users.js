const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    completeOnboarding
} = require('../controllers/users');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Onboarding route
router.post('/onboarding', protect, completeOnboarding);

router
    .route('/')
    .get(getUsers)
    .post(protect, createUser);

router
    .route('/:id')
    .get(getUser)
    .put(protect, updateUser)
    .delete(protect, deleteUser);

module.exports = router;
