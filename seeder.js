const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

//load env vars
dotenv.config({path: './config/config.env'})

//load models

const Recipe = require('./models/recipes')
const Category = require('./models/categories')


//connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})

//read json files

const recipes = JSON.parse(fs.readFileSync(`${__dirname}/_data/recipes.json`, 'utf-8'))
const categories = JSON.parse(fs.readFileSync(`${__dirname}/_data/categories.json`, 'utf-8'))

//import into db

const importData = async () => {
    try {
        await Recipe.create(recipes)
        await Category.create(categories)
        console.log('Data imported...');
        process.exit()
    } catch (err) {
        console.log(err);
    }
}

//delete data

const deleteData = async () => {
    try {
        await Recipe.deleteMany()
        await Category.deleteMany()
        console.log('Data deleted...');
        process.exit()
    } catch (err) {
        console.log(err);
    }
}

if(process.argv[2] === '-i') {
    importData()
}else if(process.argv[2] === '-d') {
    deleteData()
}

