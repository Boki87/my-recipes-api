const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Category = require('../models/categories')



// @desc        Get all categories
// @route       GET /api/v1/categories
// @access      Public
exports.getCategories = asyncHandler(async (req, res, next) => {


    const categories = await Category.find(req.query)

    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
    })

})

// @desc        Get all categories
// @route       GET /api/v1/categories
// @access      Public
exports.getCategory = asyncHandler(async (req, res, next) => {


    const category = await Category.findById(req.params.id)

    if(!category) {
        return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,        
        data: category
    })

})

// @desc        Create category
// @route       POST /api/v1/categories
// @access      Private
exports.createCategory = asyncHandler(async (req, res, next) => {


    let category = await Category.create(req.body)

    res.status(200).json({
        success: true,        
        data: category
    })

})

// @desc        Update category
// @route       PUT /api/v1/categories/:id
// @access      Private
exports.updateCategory = asyncHandler(async (req, res, next) => {


    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })


    if(!category) {
        return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404))
    }


    res.status(200).json({
        success: true,        
        data: category
    })

})

// @desc        Delete category
// @route       DELETE /api/v1/categories/:id
// @access      Private
exports.deleteCategory = asyncHandler(async (req, res, next) => {


    const category = await Category.findByIdAndDelete(req.params.id)


    if(!category) {
        return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404))
    }


    res.status(200).json({
        success: true,        
        data: {}
    })

})