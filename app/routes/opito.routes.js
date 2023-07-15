const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const opito = require('../controllers/opito.controller')

  const router = require('express').Router()

  router.get('/', secure, opito.findAll)

  app.use('/api/opito', router)
}
