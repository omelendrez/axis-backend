const auth = require('../middleware/auth')
const cache = require('../middleware/cache')
const handler = require('../middleware/handler')

const secure = auth.validateToken

module.exports = (app) => {
  const state = require('../controllers/state.controller')

  const router = require('express').Router()

  router.post('/', secure, state.create, cache.del)

  router.get('/', secure, cache.get, state.findAll, cache.set, handler.resp)

  router.get('/:id', secure, cache.get, state.findOne, cache.set, handler.resp)

  router.put('/:id', secure, state.update, cache.del)

  router.delete('/:id', secure, state.delete, cache.del)

  router.delete('/', secure, state.deleteAll, cache.del)

  app.use('/api/state', router)
}
