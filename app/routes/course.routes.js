const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const course = require('../controllers/course.controller')

  const router = require('express').Router()

  router.post('/', secure, course.create)

  router.get('/', secure, course.findAll)

  router.get('/:id', secure, course.findOne)

  router.get('/:id/view', secure, course.findOneView)

  router.put('/:id', secure, course.update)

  router.delete('/:id', secure, course.delete)

  router.delete('/', secure, course.deleteAll)

  app.use('/api/course', router)
}
