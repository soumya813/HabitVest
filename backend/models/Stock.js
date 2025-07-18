const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a stock name'],
        trim: true
    },
    symbol: {
        type: String,
        required: [true, 'Please add a stock symbol'],
        unique: true,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
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

module.exports = mongoose.model('Stock', StockSchema);
