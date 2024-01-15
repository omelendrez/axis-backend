const router = require('express').Router()
const state = require('../controllers/state.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  router.post('/', secure, state.create, cache.res)

  router.get('/', secure, cache.get, state.findAll, cache.set, cache.res)

  router.get('/:id', secure, cache.get, state.findOne, cache.set, cache.res)

  router.put('/:id', secure, state.update, cache.res)

  router.delete('/:id', secure, state.delete, cache.res)

  // router.delete('/', secure, state.deleteAll)

  app.use('/api/state', router)
}
