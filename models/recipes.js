const mongoose = require('mongoose')

const RecipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add name'],
        maxlength: [50, 'Name can not be more than 50 characters'],
        trim: true
    },

    photo: {
        type: String,
        default: 'no-photo.jpg'
    },

    isPrivate: {
        type: Boolean,
        default: false
    },

    ingredients: [String],

    preparationDescription: {
        type: String,
        required: [true, 'Please add description']
    },

    preparationTime:Number,

    numberOfServings: Number,

    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating can not be greater than 5'],
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    }
})

module.exports = mongoose.model('Recipe', RecipeSchema)