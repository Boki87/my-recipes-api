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
    
    recipe: {
        type: mongoose.Schema.ObjectId,
        ref: 'Recipe',
        required: true
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
})


//prevent user from submitting more than one rating per recipe
RatingSchema.index({ recipe: 1, user: 1 }, { unique: true });


RatingSchema.statics.getAverageRating = async function(recipeId) {

    const obj = await this.aggregate([
        {
            $match: {recipe: recipeId}
        },
        {
            $group: {
                _id: '$recipe',
                averageRating: {$avg: '$rating'}
            }
        }
    ])

    try {
        await this.model('Recipe').findByIdAndUpdate(recipeId, {
            averageRating: obj[0].averageRating
        })
    } catch (err) {
        console.log(err);
    }

}

RatingSchema.post('save', function() {
    this.constructor.getAverageRating(this.recipe)
})

RatingSchema.pre('save', function() {
    this.constructor.getAverageRating(this.recipe)
})

module.exports = mongoose.model('Rating', RatingSchema)