const webpush = require('web-push');
const User = require('../models/User');

// Ensure VAPID keys configured
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:example@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

exports.getPublicKey = async (req, res) => {
  if (!process.env.VAPID_PUBLIC_KEY) {
    return res.status(500).json({ success: false, msg: 'VAPID public key not configured' });
  }
  res.json({ success: true, key: process.env.VAPID_PUBLIC_KEY });
};

exports.subscribe = async (req, res) => {
  try {
    const sub = req.body;
    if (!sub || !sub.endpoint) {
      return res.status(400).json({ success: false, msg: 'Invalid subscription' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, msg: 'User not found' });

    const exists = user.pushSubscriptions.some(s => s.endpoint === sub.endpoint);
    if (!exists) {
      user.pushSubscriptions.push(sub);
      await user.save();
    }
    res.json({ success: true });
  } catch (e) {
    console.error('Subscribe error', e);
    res.status(500).json({ success: false, msg: 'Failed to subscribe' });
  }
};

exports.unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body || {};
    if (!endpoint) return res.status(400).json({ success: false, msg: 'Endpoint required' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, msg: 'User not found' });
    user.pushSubscriptions = user.pushSubscriptions.filter(s => s.endpoint !== endpoint);
    await user.save();
    res.json({ success: true });
  } catch (e) {
    console.error('Unsubscribe error', e);
    res.status(500).json({ success: false, msg: 'Failed to unsubscribe' });
  }
};

exports.sendTest = async (req, res) => {
  try {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return res.status(500).json({ success: false, msg: 'VAPID keys not configured' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, msg: 'User not found' });
    const payload = JSON.stringify({
      title: 'HabitVest',
      body: 'Push notifications are working.',
      url: process.env.FRONTEND_URL || 'http://localhost:3000'
    });
    const results = [];
    for (const sub of user.pushSubscriptions) {
      try {
        await webpush.sendNotification(sub, payload);
        results.push({ endpoint: sub.endpoint, ok: true });
      } catch (err) {
        console.error('Push send error', err?.statusCode);
        results.push({ endpoint: sub.endpoint, ok: false, status: err?.statusCode });
      }
    }
    res.json({ success: true, count: results.length, results });
  } catch (e) {
    console.error('Send test error', e);
    res.status(500).json({ success: false, msg: 'Failed to send test notification' });
  }
};
