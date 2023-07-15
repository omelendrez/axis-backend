const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const assessment = require('../controllers/course-assessment.controller')

  const router = require('express').Router()

  router.post('/', secure, assessment.create)

  router.get('/', secure, assessment.findAll)

  router.get('/:id', secure, assessment.findOne)

  router.put('/:id', secure, assessment.update)

  router.delete('/:id', secure, assessment.delete)

  router.delete('/', secure, assessment.deleteAll)

  app.use('/api/course-assessment', router)
}
