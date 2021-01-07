const crypto = require('crypto')
const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const sendEmail = require('../utils/sendEmail')
const User = require('../models/user')


// @desc        Register user
// @route       POST /api/v1/auth/register
// @access      Public
exports.register = asyncHandler( async (req, res, next) => {

    const {name, email, password } = req.body

    //create user
    const user = await User.create({
        name, email, password
    })

    sendTokenResponse(user, 200, res)
})

// @desc        Login user
// @route       POST /api/v1/auth/login
// @access      Public
exports.login = asyncHandler( async (req, res, next) => {

    const { email, password } = req.body

    //validate email and password
    if(!email || !password) {
        return next( new ErrorResponse(`Please provide an email and password`, 400))
    }

    //check for user
    const user = await User.findOne({email}).select('+password')

    if(!user) {
        return next( new ErrorResponse(`Invalid credentials`, 401))
    }

    //check if password matches
    const isMatch = await user.matchPassword(password)
    
    if(!isMatch) {
        return next( new ErrorResponse(`Invalid credentials`, 401))
    }

    sendTokenResponse(user, 200, res)
})


// @desc        Get current logged in user
// @route       GET /api/v1/auth/me
// @access      Private
exports.me = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        data: user
    })
})



// @desc        Forgot password
// @route       POST /api/v1/auth/forgotpassword
// @access      Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {

    const user = await User.findOne({email: req.body.email})

    if(!user) {
        return next( new ErrorResponse(`There is no user with that email`, 402))
    }

    //Get reset token
    const resetToken = await user.getResetPasswordToken()
    
    await user.save({validateBeforeSave: false})

    //create reset utl
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`

    const message = `To reset your password visit this url: ${resetUrl}`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        })
        res.status(200).json({
            success: true,
            data: 'Email sent'
        })
    } catch (err) {
        console.log(err);
        user.getResetPasswordToken = undefined
        user.getResetPasswordExpire = undefined
        await user.save({validateBeforeSave: false})
        return next(new ErrorResponse('Email could not be sent', 500))
    }

    res.status(200).json({
        success: true,
        data: user
    })
})


// @desc        Reset password
// @route       PUT /api/v1/auth/resetpassword/:resettoken
// @access      Public
exports.resetPassword = asyncHandler(async (req, res, next) => {

    //get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')



    const user = await User.findOne({ //find user with the resetPassword token and where  the expire date is still not expired
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    })
    console.log(Date.now(), req.params.resettoken, resetPasswordToken);
    if(!user) {
        return next( new ErrorResponse('Invalid token', 400))
    }

    //set new password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()


    sendTokenResponse(user, 200, res)
})


// @desc        Update user details
// @route       PUT /api/v1/auth/updatedetails
// @access      Private
exports.updateDetails = asyncHandler(async (req, res, next) => {

    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        validateBeforeSave: true
    })
    

    res.status(200).json({
        success: true,
        data: user
    })
})

// @desc        Update password
// @route       PUT /api/v1/auth/updatePassword
// @access      Private
exports.updatePassword = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password')

    //Check current password
    if(!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 401))
    }

    user.password = req.body.newPassword
    await user.save()

    sendTokenResponse(user, 200, res)
})


//get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {

    //create token
    const token = user.getSignedJwtToken()

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production') {
        options.secure = true
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        })

}