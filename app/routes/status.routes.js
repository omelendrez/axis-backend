const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const status = require('../controllers/status.controller.js')

  const router = require('express').Router()

  router.post('/', secure, status.create)

  router.get('/', secure, status.findAll)

  router.get('/:id', secure, status.findOne)

  router.put('/:id', secure, status.update)

  router.delete('/:id', secure, status.delete)

  router.delete('/', secure, status.deleteAll)

  app.use('/api/status', router)
}
