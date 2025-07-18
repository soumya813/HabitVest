const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a reward name'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    points: {
        type: Number,
        required: [true, 'Please add a point value']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Reward', RewardSchema);
