const Stock = require('../models/Stock');
const User = require('../models/User');

// @desc    Get all stocks
// @route   GET /api/v1/stocks
// @route   GET /api/v1/users/:userId/stocks
// @access  Public
exports.getStocks = async (req, res, next) => {
    try {
        let query;

        if (req.params.userId) {
            query = Stock.find({ user: req.params.userId });
        } else {
            query = Stock.find();
        }

        const stocks = await query;

        res.status(200).json({
            success: true,
            count: stocks.length,
            data: stocks
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Get single stock
// @route   GET /api/v1/stocks/:id
// @access  Public
exports.getStock = async (req, res, next) => {
    try {
        const stock = await Stock.findById(req.params.id).populate({
            path: 'user',
            select: 'username'
        });

        if (!stock) {
            return res.status(404).json({ success: false });
        }

        res.status(200).json({
            success: true,
            data: stock
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Create new stock
// @route   POST /api/v1/users/:userId/stocks
// @access  Private
exports.createStock = async (req, res, next) => {
    try {
        req.body.user = req.params.userId;

        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ success: false });
        }

        const stock = await Stock.create(req.body);

        res.status(201).json({
            success: true,
            data: stock
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Update stock
// @route   PUT /api/v1/stocks/:id
// @access  Private
exports.updateStock = async (req, res, next) => {
    try {
        let stock = await Stock.findById(req.params.id);

        if (!stock) {
            return res.status(404).json({ success: false });
        }

        stock = await Stock.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: stock
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Delete stock
// @route   DELETE /api/v1/stocks/:id
// @access  Private
exports.deleteStock = async (req, res, next) => {
    try {
        const stock = await Stock.findById(req.params.id);

        if (!stock) {
            return res.status(404).json({ success: false });
        }

        await stock.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};
