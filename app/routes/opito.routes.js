const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const opito = require('../controllers/opito.controller')

  const router = require('express').Router()

  router.get('/', secure, opito.findAll)

  router.get('/file', secure, opito.fileList)

  router.get('/content', secure, opito.fileContent)

  app.use('/api/opito', router)
}
