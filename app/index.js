const express = require('express')
const cors = require('cors')
const { log } = require('./helpers/log.js')
const logger = require('morgan')
const errorHandler = require('./errors/error-handler.js')
require('dotenv').config()

const app = express()

const whitelist = [
  'http://localhost:5173',
  'http://localhost',
  'http://localhost:4173',
  'http://192.168.0.139:5173',
  'http://192.168.1.88',
  'http://axis2',
  'https://axis-tolmann.vercel.app'
]

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (whitelist.indexOf(origin) === -1) {
      const msg =
        'The CORS policy for this site does not ' +
        'allow access from the specified Origin.'
      return callback(new Error(msg), false)
    }
    return callback(null, true)
  }
}

app.use(cors(corsOptions))

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use(
  logger('dev', {
    // skip: (req, res) => res.statusCode < 400
  })
)

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Axis.' })
})

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'
  )
  next()
})

require('./routes/certificate-type.routes.js')(app)
require('./routes/company.routes.js')(app)
require('./routes/contact-info.routes.js')(app)
require('./routes/contact-type.routes.js')(app)
require('./routes/course-item.routes.js')(app)
require('./routes/course.routes.js')(app)
require('./routes/learner.routes.js')(app)
require('./routes/nationality.routes.js')(app)
require('./routes/role.routes.js')(app)
require('./routes/state.routes.js')(app)
require('./routes/training.routes.js')(app)
require('./routes/user.routes.js')(app)

app.use(errorHandler.middleware)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  log.info(`Server is running on port ${PORT}.`)
})
