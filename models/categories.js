const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add name'],
        maxlength: [20, 'Name can not be more than 20 characters'],
        trim: true,
        unique: [true, 'This category already exists']
    }
})

module.exports = mongoose.model('Category', CategorySchema)