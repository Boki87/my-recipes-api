const path = require('path')
const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Recipe = require('../models/recipes')


// @desc        Get all recipes
// @route       GET /api/v1/recipes
// @access      Public

exports.getRecipes = asyncHandler(async (req, res, next) => {
  
        let query
    
        // Copy req.query
        const reqQuery = {...req.query}

        //fields to exclude so we dont match as a filed in regular query, these are special mongoose methods to query the db
        const removeFields = ['select', 'sort', 'page', 'limit']

        //loop over removeFields and remove them from reqQuery
        removeFields.forEach(param => delete reqQuery[param])

        // console.log(reqQuery);



        // create query string
        let queryStr = JSON.stringify(reqQuery)

        //create operators ($gt, $gte. $lt, etc), mongoose operators for (greater then, greater then and equal, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)


        

        if(req.query.name) {
            queryStr = JSON.parse(queryStr)
            queryStr.name = { "$regex": req.query.name }
            queryStr = JSON.stringify(queryStr)
        }
        
        console.log(666, queryStr);
        // Find resource and populate category path with name from category model
        query = Recipe.find(JSON.parse(queryStr)).populate({
            path: 'category',
            select: 'name'
        }).populate({
            path: 'user',
            select: 'name'
        }) //populate category path with name from the category document

        
        


        //Select fields, select only selected per resource from db
        if(req.query.select) {
            const fields = req.query.select.split(',').join(' ')            
            query = query.select(fields)
        }

        //sort
        //exp select & sort descending: {{URL}}/api/v1/recipes?select=preparationDescription,name&sort=-name
        if(req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ')            
            query = query.sort(sortBy)
        }else{
            //default sort
            query = query.sort('-createdAt')
        }

        //pagination logic|query
        const page = parseInt(req.query.page, 8) || 1 //default is 1
        const limit = parseInt(req.query.limit, 8) || 8 //default to 8 resources per page
        const startIndex = (page - 1) * limit
        const endIndex = page * limit
        const total = await Recipe.countDocuments()

        query = query.skip(startIndex).limit(limit)

        //execute query
        const recipes = await query
    
    
        //Pagination result
        const pagination = {
            total: Math.ceil(total / limit)
        }
        

        if(endIndex < total) {
            
            pagination.next = {
                page: page + 1,
                limit
            }
        }

        if(startIndex > 0) {            
            pagination.prev = {
                page: page - 1,
                limit
            }
        }        


        res.status(200).json({
            success: true,
            count:recipes.length, 
            pagination,
            data: recipes
        })
  
})


// @desc        Get single recipes
// @route       GET /api/v1/recipes/:id
// @access      Private
exports.getRecipe = asyncHandler(async (req, res, next) => {
    
        const recipe = await (await Recipe.findById(req.params.id).populate({
            path: 'category',
            select: 'name'
        }).populate({
            path: 'user',
            select: 'name'
        }))
    
        if(!recipe) {
            return next(new ErrorResponse(`Recipe not found with id of ${req.params.id}`, 404)) //error when id does not exist 
        }
    
        res.status(200).json({
            success: true,
            data: recipe
        })
})


// @desc        Create recipe
// @route       POST /api/v1/recipes
// @access      Private
exports.createRecipe = asyncHandler(async (req, res, next) => {

        //add user to req.body
        //we have req.user already set in our auth middleware (protect)
        req.body.user = req.user.id

        var recipe = await Recipe.create(req.body)

        res.status(201).json({
            success: true,
            data: recipe
        })
  
})


// @desc        Update recipe
// @route       PUT /api/v1/recipes/:id
// @access      Private
exports.updateRecipe = asyncHandler(async (req, res, next) => {
    
        let recipe = await Recipe.findById(req.params.id)
    
        if(!recipe) {
            return next(new ErrorResponse(`Recipe not found with id of ${req.params.id}`, 404)) //error when id does not exist 
        }
    
        //make sure user is recipe owner
        if(recipe.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this recipe`, 401)) 
        }

        recipe = await Recipe.findOneAndUpdate({_id: req.params.id}, req.body, {
            new: true,
            runValidators: true
        })
        
        res.status(201).json({
            success: true,
            data: recipe
        })
    
})


// @desc        Delete recipe
// @route       DELETE /api/v1/recipes/:id
// @access      Private
exports.deleteRecipe = asyncHandler(async (req, res, next) => {
    
        let recipe = await Recipe.findById(req.params.id)
    
        if(!recipe) {
            return next(new ErrorResponse(`Recipe not found with id of ${req.params.id}`, 404)) //error when id does not exist 
        }
    
         //make sure user is recipe owner
         if(recipe.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this recipe`, 401)) 
        }

        recipe.remove()

        res.status(201).json({
            success: true,
            data: {}
        })
    
})


// @desc        Update photo for recipe
// @route       PUT /api/v1/recipes/:id/photo
// @access      Private
exports.recipeUploadPhoto = asyncHandler(async (req, res, next) => {
    
    const recipe = await Recipe.findById(req.params.id)

    if(!recipe) {
        return next(new ErrorResponse(`Recipe not found with id of ${req.params.id}`, 404)) //error when id does not exist 
    }


    if(!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400)) 
    }

    const file = req.files.file

    //make sure image is a photo
    if(!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400)) 
    }

    //Check file size
    if(file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`File size can not be larger than ${process.env.MAX_FILE_UPLOAD}`, 400)) 
    }

    //create custom filename
    file.name = `photo_${recipe._id}${path.parse(file.name).ext}`

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err) {
            console.error(err);
            return next(new ErrorResponse(`Problem with file upload`, 500))
        }

        //update the recipe with the path to the uploaded photo

        await Recipe.findByIdAndUpdate(req.params.id, {photo: file.name})

        res.status(200).json({
            success: true,
            data: file.name
        })

    })

})
