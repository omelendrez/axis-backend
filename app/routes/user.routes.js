const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const user = require('../controllers/user.controller.js')

  const router = require('express').Router()

  router.post('/', secure, user.create)

  router.get('/', secure, user.findAll)

  router.get('/:id', secure, user.findOne)

  router.get('/:id/view', secure, user.findOneView)

  router.put('/:id', secure, user.update)

  router.put('/:id/chgpwd', secure, user.chgPwd)

  router.delete('/:id', secure, user.delete)

  router.delete('/', secure, user.deleteAll)

  router.post('/login', user.login)

  app.use('/api/user', router)
}
