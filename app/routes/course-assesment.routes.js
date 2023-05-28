const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const assesment = require('../controllers/course-assesment.controller.js')

  const router = require('express').Router()

  router.post('/', secure, assesment.create)

  router.get('/', secure, assesment.findAll)

  router.get('/:id', secure, assesment.findOne)

  router.put('/:id', secure, assesment.update)

  router.delete('/:id', secure, assesment.delete)

  router.delete('/', secure, assesment.deleteAll)

  app.use('/api/course-assesment', router)
}
