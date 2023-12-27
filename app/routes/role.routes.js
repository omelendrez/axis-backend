const auth = require('../middleware/auth')
const cache = require('../middleware/cache')
const handler = require('../middleware/handler')

const secure = auth.validateToken

module.exports = (app) => {
  const role = require('../controllers/role.controller')

  const router = require('express').Router()

  router.post('/', secure, role.create, cache.del)

  router.get('/', secure, cache.get, role.findAll, cache.set, handler.resp)

  router.get('/:id', secure, cache.get, role.findOne, cache.set, handler.resp)

  router.put('/:id', secure, role.update, cache.del)

  router.delete('/:id', secure, role.delete, cache.del)

  router.delete('/', secure, role.deleteAll, cache.del)

  app.use('/api/role', router)
}
