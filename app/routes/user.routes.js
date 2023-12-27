const auth = require('../middleware/auth')
const cache = require('../middleware/cache')
const handler = require('../middleware/handler')

const secure = auth.validateToken

module.exports = (app) => {
  const user = require('../controllers/user.controller')

  const router = require('express').Router()

  router.post('/', secure, user.create, cache.del)

  router.get('/', secure, cache.get, user.findAll, cache.set, handler.resp)

  router.get('/:id', secure, cache.get, user.findOne, cache.set, handler.resp)

  router.get(
    '/:id/view',
    secure,
    cache.get,
    user.findOneView,
    cache.set,
    handler.resp
  )

  router.put('/:id', secure, user.update, cache.del)

  router.put('/:id/chgpwd', secure, user.chgPwd)

  router.post('/:id/reset', secure, user.reset)

  router.delete('/:id', secure, user.delete, cache.del)

  router.delete('/', secure, user.deleteAll, cache.del)

  router.post('/login', user.login)

  app.use('/api/user', router)
}
