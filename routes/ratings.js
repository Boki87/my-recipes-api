const express = require('express')
const {addRating} = require('../controllers/ratings')
// const router = express.Router()

const router = express.Router({ mergeParams: true });

const {protect} = require('../middleware/auth')

router.route('/').post(protect, addRating)

module.exports = router