const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const courseModule = require('../controllers/course-module.controller')

  const router = require('express').Router()

  router.post('/', secure, courseModule.create)

  router.get('/', secure, courseModule.findAll)

  router.get('/:id', secure, courseModule.findOne)

  router.get('/:id/course', secure, courseModule.findByCourse)

  router.put('/:id', secure, courseModule.update)

  router.delete('/:id', secure, courseModule.delete)

  // router.delete('/', secure, courseModule.deleteAll)

  app.use('/api/course-module', router)
}
