const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const training = require('../controllers/training.controller')

  const router = require('express').Router()

  router.post('/', secure, training.create) // Create training in learner view

  router.get('/:id/all', secure, training.findAll) // Used by the learner view controller

  router.get('/:id/classroom', secure, training.findAllByClassroom)

  router.get('/:id/view', secure, training.findOneView)

  router.get('/:id/tracking', secure, training.findTracking)

  router.get('/:id/medical', secure, training.findMedicalData)

  router.get('/:id/course', secure, training.findCourse)

  router.get('/:id/course-items', secure, training.findCourseItems)

  router.get('/:id', secure, training.findOne) // Used by Edit training in learner view

  router.put('/:id', secure, training.update) // Used by save training in learner view

  router.delete('/:id', secure, training.delete)

  router.delete('/', secure, training.deleteAll)

  app.use('/api/training', router)
}
