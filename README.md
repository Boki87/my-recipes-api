# My Recipes Backend API

Personal project where I learned building with the MERN stack.


## Core packages

1. express
2. express-fileupload
3. mongoose
4. jsonwebtoken

## Running locally 

Inside the config folder create a config.env file with the following contents:

```javascript
NODE_ENV=development
PORT=5000

MONGO_URI=<YOUR MONGO URI>

FILE_UPLOAD_PATH= ./public/uploads
MAX_FILE_UPLOAD=1000000

JWT_SECRET=<some random string>
JWT_EXPIRE=10d
JWT_COOKIE_EXPIRE=10

SMTP_HOST=
SMTP_PORT=
SMTP_EMAIL=
SMTP_PASSWORD=
FROM_EMAIL=noreply@myrecipes.com
FROM_NAME=myrecipes.com
```

Then run <code>npm i</code> and <code>npm run dev</code> to start the development server
