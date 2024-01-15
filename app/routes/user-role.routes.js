const router = require('express').Router()
const userRole = require('../controllers/user-role.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  router.post('/', secure, userRole.create, cache.res)

  router.get('/:id', secure, cache.get, userRole.findAll, cache.set, cache.res)

  router.get(
    '/:id/available',
    secure,
    cache.get,
    userRole.findAllAvailable,
    cache.set,
    cache.res
  )

  router.delete('/:id', secure, userRole.delete, cache.res)

  // router.delete('/', secure, userRole.deleteAll)

  app.use('/api/user-role', router)
}
