const auth = require('../middleware/auth')
const cache = require('../middleware/cache')
const handler = require('../middleware/handler')

const secure = auth.validateToken

module.exports = (app) => {
  const userRole = require('../controllers/user-role.controller')

  const router = require('express').Router()

  router.post('/', secure, userRole.create, cache.del)

  router.get(
    '/:id',
    secure,
    cache.get,
    userRole.findAll,
    cache.set,
    handler.resp
  )

  router.get(
    '/:id/available',
    secure,
    cache.get,
    userRole.findAllAvailable,
    cache.set,
    handler.resp
  )

  router.delete('/:id', secure, userRole.delete, cache.del)

  router.delete('/', secure, userRole.deleteAll, cache.del)

  app.use('/api/user-role', router)
}
