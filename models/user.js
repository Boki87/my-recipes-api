const crypto = require('crypto')
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
    
    if(!this.isModified('password')) { //if password is not modified don't run code under
        next()
    }

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

//Generate and hash password token
UserSchema.methods.getResetPasswordToken = async function(enteredPassword) {
    //generate token
    const resetToken = crypto.randomBytes(20).toString('hex')

    //hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    //set expire
    this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000) //10 minutes

    return resetToken
}

module.exports = mongoose.model('User', UserSchema)