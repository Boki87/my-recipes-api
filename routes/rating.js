const express = require('express')
const {addRating} = require('../controllers/rating')
const router = express.Router()

const {protected} = require('../middleware/auth')

router.route('/').post(protected, addRating)