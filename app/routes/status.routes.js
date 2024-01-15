const router = require('express').Router()
const status = require('../controllers/status.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  router.post('/', secure, status.create, cache.res)

  router.get('/', secure, cache.get, status.findAll, cache.set, cache.res)

  router.get('/:id', secure, cache.get, status.findOne, cache.set, cache.res)

  router.put('/:id', secure, status.update, cache.res)

  router.delete('/:id', secure, status.delete, cache.res)

  // router.delete('/', secure, status.deleteAll)

  app.use('/api/status', router)
}
