const Category = require('../models/Category');

// @desc    Get all categories for authenticated user
// @route   GET /api/v1/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ userId: req.user.id }).sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(400).json({ 
            success: false, 
            msg: 'Failed to fetch categories' 
        });
    }
};

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Private
exports.getCategory = async (req, res, next) => {
    try {
        const category = await Category.findOne({ 
            _id: req.params.id, 
            userId: req.user.id 
        });

        if (!category) {
            return res.status(404).json({ 
                success: false, 
                msg: 'Category not found' 
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (err) {
        console.error('Get category error:', err);
        res.status(400).json({ 
            success: false, 
            msg: 'Failed to fetch category' 
        });
    }
};

// @desc    Create new category
// @route   POST /api/v1/categories
// @access  Private
exports.createCategory = async (req, res, next) => {
    try {
        // Add user ID to request body
        req.body.userId = req.user.id;

        const category = await Category.create(req.body);

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (err) {
        console.error('Create category error:', err);
        
        // Handle duplicate category name
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                msg: 'Category name already exists'
            });
        }
        
        res.status(400).json({ 
            success: false, 
            msg: 'Failed to create category' 
        });
    }
};

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private
exports.updateCategory = async (req, res, next) => {
    try {
        // Find category and ensure it belongs to the user
        let category = await Category.findOne({ 
            _id: req.params.id, 
            userId: req.user.id 
        });

        if (!category) {
            return res.status(404).json({ 
                success: false, 
                msg: 'Category not found' 
            });
        }

        // Prevent updating default categories' core properties
        if (category.isDefault && (req.body.name || req.body.isDefault !== undefined)) {
            return res.status(400).json({
                success: false,
                msg: 'Cannot modify name or default status of default categories'
            });
        }

        category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (err) {
        console.error('Update category error:', err);
        
        // Handle duplicate category name
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                msg: 'Category name already exists'
            });
        }
        
        res.status(400).json({ 
            success: false, 
            msg: 'Failed to update category' 
        });
    }
};

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findOne({ 
            _id: req.params.id, 
            userId: req.user.id 
        });

        if (!category) {
            return res.status(404).json({ 
                success: false, 
                msg: 'Category not found' 
            });
        }

        // Prevent deleting default categories
        if (category.isDefault) {
            return res.status(400).json({
                success: false,
                msg: 'Cannot delete default categories'
            });
        }

        // Check if category has habits
        const Habit = require('../models/Habit');
        const habitCount = await Habit.countDocuments({ 
            category: category.name, 
            userId: req.user.id 
        });

        if (habitCount > 0) {
            return res.status(400).json({
                success: false,
                msg: `Cannot delete category. ${habitCount} habit(s) are using this category. Please reassign or delete those habits first.`
            });
        }

        await Category.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error('Delete category error:', err);
        res.status(400).json({ 
            success: false, 
            msg: 'Failed to delete category' 
        });
    }
};
