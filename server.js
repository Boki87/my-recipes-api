const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const fileupload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db')


//load env vars
dotenv.config({path:'./config/config.env'})

//Connect to database
connectDB()


//route files
const recipes = require('./routes/recipes')
const categories = require('./routes/categories')
const auth = require('./routes/auth')

const app = express()

// Body parser
app.use(express.json())

//cookie parser
app.use(cookieParser())

//Dev logging middleware
if(process.env.NODE_ENV == 'development') {
    app.use(morgan('dev'))
}


//File upload
app.use(fileupload())


//set static folder
app.use(express.static(path.join(__dirname, 'public')))
console.log(path.join(__dirname, 'public'));

//mount routes
app.use('/api/v1/recipes', recipes)
app.use('/api/v1/categories', categories)
app.use('/api/v1/auth', auth)

app.use(errorHandler)


const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
})

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    //Close server and exit process
    server.close(() => process.exit(1))
})