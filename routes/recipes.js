const express = require('express')
const {getRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe, recipeUploadPhoto} = require('../controllers/recipes')

const ratingRouter = require('./ratings')

const router = express.Router()

const {protect} = require('../middleware/auth')

// const router = express.Router({ mergeParams: true });

router.use('/:recipeId/rating', ratingRouter)

router.route('/:id/photo').put(recipeUploadPhoto)

router
    .route('/')
    .get(getRecipes)
    .post(protect, createRecipe)

router
    .route('/:id')
    .get(getRecipe)
    .put(protect, updateRecipe)
    .delete(protect, deleteRecipe)

module.exports = router