const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a reward name'],
        trim: true,
        maxlength: [100, 'Name can not be more than 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    points: {
        type: Number,
        required: [true, 'Please add a point value'],
        min: [1, 'Points must be at least 1']
    },
    category: {
        type: String,
        trim: true,
        maxlength: [50, 'Category can not be more than 50 characters']
    },
    type: {
        type: String,
        enum: ['virtual', 'physical', 'experience'],
        default: 'virtual'
    },
    isRedeemed: {
        type: Boolean,
        default: false
    },
    redeemedAt: {
        type: Date
    },
    isAvailable: {
        type: Boolean,
        default: true
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
