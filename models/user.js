const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add name']
    },
    email: {
        type: String,
        required: [true, 'Please add email'],
        unique: true,
        match: [
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
            'Please add a valid email'
        ]
    },
    role: {
        type: String,
        enum:['user','admin'],
        default: 'user'
    },
    password: {
        type: String,
        required:[true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

//Encrypt password using bcrypt
UserSchema.pre('save', async function(next) { //static method (called on the model)
    console.log('pre save');
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)    
})


//sign jwt and return
UserSchema.methods.getSignedJwtToken = function() { //methods on the actual user from db
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

//match user entered password to hashed password in db
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('User', UserSchema)