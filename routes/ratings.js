const express = require('express')
const {addRating, getRating, updateRating} = require('../controllers/ratings')
// const router = express.Router()

const router = express.Router({ mergeParams: true });

const {protect} = require('../middleware/auth')

router.route('/').post(protect, addRating)
router.route('/').get(protect, getRating)
router.route('/').put(protect, updateRating)


module.exports = router