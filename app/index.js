const express = require('express')
const cors = require('cors')
const { log } = require('./helpers/log.js')
const logger = require('morgan')
require('dotenv').config()

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://axis-tolmann.vercel.app'
]

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true)
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not ' +
          'allow access from the specified Origin.'
        return callback(new Error(msg), false)
      }
      return callback(null, true)
    }
  })
)

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use(
  logger('dev', {
    skip: function (req, res) {
      return res.statusCode < 400
    }
  })
)

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Axis.' })
})

require('./routes/user.routes.js')(app)
require('./routes/trainee.routes.js')(app)
require('./routes/role.routes.js')(app)
require('./routes/nationality.routes.js')(app)
require('./routes/state.routes.js')(app)
require('./routes/company.routes.js')(app)
require('./routes/course.routes.js')(app)
require('./routes/certificate-type.routes.js')(app)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  log.info(`Server is running on port ${PORT}.`)
})
