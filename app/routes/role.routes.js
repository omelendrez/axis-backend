const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const role = require('../controllers/role.controller.js')

  const router = require('express').Router()

  router.post('/', secure, role.create)

  router.get('/', secure, role.findAll)

  router.get('/:id', secure, role.findOne)

  router.put('/:id', secure, role.update)

  router.delete('/:id', secure, role.delete)

  router.delete('/', secure, role.deleteAll)

  app.use('/api/role', router)
}
