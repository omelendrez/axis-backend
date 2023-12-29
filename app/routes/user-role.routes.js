const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const userRole = require('../controllers/user-role.controller')

  const router = require('express').Router()

  router.post('/', secure, userRole.create)

  router.get('/:id', secure, userRole.findAll)

  router.get('/:id/available', secure, userRole.findAllAvailable)

  router.delete('/:id', secure, userRole.delete)

  router.delete('/', secure, userRole.deleteAll)

  app.use('/api/user-role', router)
}
