const router = require('express').Router()
const role = require('../controllers/role.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  router.post('/', secure, role.create, cache.res)

  router.get('/', secure, cache.get, role.findAll, cache.set, cache.res)

  router.get('/:id', secure, cache.get, role.findOne, cache.set, cache.res)

  router.put('/:id', secure, role.update, cache.res)

  router.delete('/:id', secure, role.delete, cache.res)

  // router.delete('/', secure, role.deleteAll)

  app.use('/api/role', router)
}
