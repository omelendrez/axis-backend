const express = require('express')
const cors = require('cors')
const { log } = require('./helpers/log.js')
const logger = require('morgan')
require('dotenv').config()

const app = express()

// const whitelist = [
//   'http://localhost:5173',
//   'http://localhost:4173',
//   'http://192.168.0.139:5173',
//   'https://axis-tolmann.vercel.app'
// ]

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true)
//     if (whitelist.indexOf(origin) === -1) {
//       const msg =
//         'The CORS policy for this site does not ' +
//         'allow access from the specified Origin.'
//       return callback(new Error(msg), false)
//     }
//     return callback(null, true)
//   }
// }

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}

app.use(cors(corsOptions))

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use(
  logger('dev', {
    skip: (req, res) => res.statusCode < 400
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

require('./routes/user.routes.js')(app)
require('./routes/training.routes.js')(app)
require('./routes/role.routes.js')(app)
require('./routes/nationality.routes.js')(app)
require('./routes/state.routes.js')(app)
require('./routes/company.routes.js')(app)
require('./routes/course.routes.js')(app)
require('./routes/certificate-type.routes.js')(app)
require('./routes/trainee.routes.js')(app)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  log.info(`Server is running on port ${PORT}.`)
})
