const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const courseAssesmentRel = require('../controllers/course-assesment-rel.controller.js')

  const router = require('express').Router()

  router.post('/', secure, courseAssesmentRel.create)

  router.get('/:id', secure, courseAssesmentRel.findAll)

  router.get('/:id/available', secure, courseAssesmentRel.findAllAvailable)

  router.delete('/:id', secure, courseAssesmentRel.delete)

  router.delete('/', secure, courseAssesmentRel.deleteAll)

  app.use('/api/course-assesment-rel', router)
}
