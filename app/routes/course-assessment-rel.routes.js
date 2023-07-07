const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const courseAssessmentRel = require('../controllers/course-assessment-rel.controller.js')

  const router = require('express').Router()

  router.post('/', secure, courseAssessmentRel.create)

  router.get('/:id', secure, courseAssessmentRel.findAll)

  router.get('/:id/available', secure, courseAssessmentRel.findAllAvailable)

  router.delete('/:id', secure, courseAssessmentRel.delete)

  router.delete('/', secure, courseAssessmentRel.deleteAll)

  app.use('/api/course-assessment-rel', router)
}
