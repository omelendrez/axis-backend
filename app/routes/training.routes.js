const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const training = require('../controllers/training.controller.js')

  const router = require('express').Router()

  router.post('/', secure, training.create)

  router.get('/:id/all', secure, training.findAll)

  router.get('/:id/classroom', secure, training.findAllByClassroom)

  router.get('/:id/view', secure, training.findOneView)

  router.get('/:id/tracking', secure, training.findTracking)

  router.get('/:id/medical', secure, training.findMedicalData)

  router.get('/:id/course-items', secure, training.findCourseItems)

  router.get('/:id', secure, training.findOne)

  router.put('/:id', secure, training.update)

  router.delete('/:id', secure, training.delete)

  router.delete('/', secure, training.deleteAll)

  app.use('/api/training', router)
}
