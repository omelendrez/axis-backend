const auth = require('../middleware/auth')
const cache = require('../middleware/cache')
const handler = require('../middleware/handler')

const secure = auth.validateToken

module.exports = (app) => {
  const status = require('../controllers/status.controller')

  const router = require('express').Router()

  router.post('/', secure, status.create, cache.del)

  router.get('/', secure, cache.get, status.findAll, cache.set, handler.resp)

  router.get('/:id', secure, cache.get, status.findOne, cache.set, handler.resp)

  router.put('/:id', secure, status.update, cache.del)

  router.delete('/:id', secure, status.delete, cache.del)

  router.delete('/', secure, status.deleteAll, cache.del)

  app.use('/api/status', router)
}
