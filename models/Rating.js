const mongoose = require('mongoose')

const RatingSchema = new mongoose.Schema({
    
    rating: {
        type: Number,
        min: 0,
        max: 5,
        required: [true, 'Please add a rating between 0 and 5']
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },

    Recipe: {
        type: mongoose.Schema.ObjectId,
        ref: 'Recipe',
        required: true
    },
})


//prevent user from submiting more than one rating per recipe
RatingSchema.index({recipe: 1, user: 1}, {uniqe: true})

module.exports = mongoose.model('Rating', RatingSchema)