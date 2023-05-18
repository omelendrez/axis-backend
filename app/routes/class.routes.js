const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const classroom = require('../controllers/class.controller.js')

  const router = require('express').Router()

  router.post('/', secure, classroom.create)

  router.get('/', secure, classroom.findAll)

  router.get('/:id', secure, classroom.findOne)

  router.put('/:id', secure, classroom.update)

  router.delete('/:id', secure, classroom.delete)

  router.delete('/', secure, classroom.deleteAll)

  app.use('/api/class', router)
}
