const express = require('express');
const { protect } = require('../middleware/auth');
const { getPublicKey, subscribe, unsubscribe, sendTest } = require('../controllers/push');

const router = express.Router();

router.get('/public-key', getPublicKey);
router.post('/subscribe', protect, subscribe);
router.post('/unsubscribe', protect, unsubscribe);
router.post('/test', protect, sendTest);

module.exports = router;
