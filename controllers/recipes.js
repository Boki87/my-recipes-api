const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Recipe = require('../models/recipes')


// @desc        Get all recipes
// @route       GET /api/v1/recipes
// @access      Public

exports.getRecipes = asyncHandler(async (req, res, next) => {
  
        let query
    
        let queryStr = JSON.stringify(req.query)

        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
    
        query = Recipe.find(JSON.parse(queryStr))
        
        const recipes = await query
    
    
        res.status(200).json({
            success: true,
            count:recipes.length, 
            data: recipes
        })
  
})


// @desc        Get single recipes
// @route       GET /api/v1/recipes/:id
// @access      Private
exports.getRecipe = asyncHandler(async (req, res, next) => {
    
        const recipe = await Recipe.findById(req.params.id)
    
        if(!recipe) {
            return next(new ErrorResponse(`Recipe not found with id of ${req.params.id}`, 404)) //error when id does not exist 
        }
    
        res.status(200).json({
            success: true,
            data: recipe
        })
})


// @desc        Create recipe
// @route       POST /api/v1/recipes
// @access      Private
exports.createRecipe = asyncHandler(async (req, res, next) => {

        var recipe = await Recipe.create(req.body)
    
        res.status(201).json({
            success: true,
            data: recipe
        })
  
})


// @desc        Update recipe
// @route       PUT /api/v1/recipes/:id
// @access      Private
exports.updateRecipe = asyncHandler(async (req, res, next) => {
    
        const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
    
        if(!recipe) {
            return next(new ErrorResponse(`Recipe not found with id of ${req.params.id}`, 404)) //error when id does not exist 
        }
    
        res.status(201).json({
            success: true,
            data: recipe
        })
    
})


// @desc        Delete recipe
// @route       DELETE /api/v1/recipes/:id
// @access      Private
exports.deleteRecipe = asyncHandler(async (req, res, next) => {
    
        const recipe = await Recipe.findByIdAndDelete(req.params.id)
    
        if(!recipe) {
            return next(new ErrorResponse(`Recipe not found with id of ${req.params.id}`, 404)) //error when id does not exist 
        }
    
        res.status(201).json({
            success: true,
            data: {}
        })
    
})