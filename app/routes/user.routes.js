const router = require('express').Router()
const user = require('../controllers/user.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  router.post('/', secure, user.create, cache.res)

  router.get('/', secure, cache.get, user.findAll, cache.set, cache.res)

  router.get('/:id', secure, cache.get, user.findOne, cache.set, cache.res)

  router.get(
    '/:id/view',
    secure,
    cache.get,
    user.findOneView,
    cache.set,
    cache.res
  )

  router.put('/:id', secure, user.update, cache.res)

  router.put('/:id/chgpwd', secure, user.chgPwd)

  router.post('/:id/reset', secure, user.reset)

  router.delete('/:id', secure, user.delete, cache.res)

  // router.delete('/', secure, user.deleteAll)

  router.post('/login', user.login)

  app.use('/api/user', router)
}
