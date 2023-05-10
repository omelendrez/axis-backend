const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const courseItem = require('../controllers/course.controller.js')

  const router = require('express').Router()

  router.post('/', secure, courseItem.create)

  router.get('/', secure, courseItem.findAll)

  router.get('/:id', secure, courseItem.findOne)

  router.put('/:id', secure, courseItem.update)

  router.delete('/:id', secure, courseItem.delete)

  router.delete('/', secure, courseItem.deleteAll)

  app.use('/api/course', router)
}
