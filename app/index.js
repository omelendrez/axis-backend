const express = require('express')
const cors = require('cors')
const logger = require('morgan')
const { log } = require('./helpers/log')
const errorHandler = require('./errors/error-handler')
const { listEndpoints } = require('./helpers/utils')
require('dotenv').config()

const socketIO = require('./socket.io')

const app = express()

const httpServer = require('http').createServer(app)

const whitelist = [
  'http://localhost:5173',
  'http://localhost',
  'http://localhost:4173',
  'http://192.168.0.139:5173',
  'http://192.168.0.102',
  'http://192.168.0.139',
  'http://192.168.0.139:4173',
  'http://192.168.1.88',
  'http://192.168.0.96',
  'http://axis2'
]

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (whitelist.indexOf(origin) === -1) {
      const reason =
        'The CORS policy for this site does not ' +
        'allow access from the specified Origin.'
      return callback(new Error(reason), false)
    }
    return callback(null, true)
  }
}

app.use(cors(corsOptions))

const io = require('socket.io')(httpServer, {
  cors: {
    origin: whitelist
  }
})

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use(
  logger('dev', {
    skip: (req, res) => res.statusCode < 400
  })
)

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Axis V2.0.' })
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

require('./routes')(app)

app.use(errorHandler.middleware)

const PORT = process.env.PORT || 3000

httpServer.listen(PORT, () => {
  log.info(`Server is running on port ${PORT}.`)
})

io.on('connection', (socket) => {
  socketIO.set(socket)
})

if (process.env.NODE_ENV !== 'production') {
  listEndpoints(app, '')
}
