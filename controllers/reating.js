const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Rating = require('../models/ratings')
const Recipe = require('../models/recipes')

// @desc        Add rating to recipe
// @route       POST /api/v1/recipes/:recipeId/rating
// @access      Public

exports.getRecipes = asyncHandler(async (req, res, next) => {

    req.body.recipe = req.params.recipeId
    req.body.user = req.user.id

    const recipe = Recipe.findById(req.params.recipeId)

    if(!recipe) {
        return next( new ErrorResponse(`No recipe found with id of: ${req.params.recipeId}`,404))        
    }

    const rating = Rating.create(req.body)

    res.status(201).json({
        success: true,
        data: rating
    })

})