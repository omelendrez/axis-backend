const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const training = require('../controllers/training.controller')

  const router = require('express').Router()

  // POST
  router
    .post('/', secure, training.create) // Create training in learner view

    // GET

    .get('/course-years', secure, training.getCourseYears) // List all start years used in all training courses

    .get('/month-by-year/:year', secure, training.getLearnerByYear) // List all trained learners grouped month for a given year

    .get('/course-by-year/:year', secure, training.getCourseByYear) // List all course records count for a given year

    .get('/course-month-by-year/:year', secure, training.getCourseMonthByYear) // List all training records count grouped by course and month for a given year

    .get('/course-type-by-year/:year', secure, training.getCourseTypeByYear) // List all training records count grouped by course type and course for a given year

    .get('/:id/all', secure, training.getAllById) // List all training records by a given learner

    .get('/:id/view', secure, training.getOneView) // Gets the data needed for the Training View component and subcomponents

    .get('/:date/:statuses', secure, training.getAllByDate) // List all training records for a given date and status

    .get('/:id', secure, training.getOne) // Gets training record for a given id (for Edit form)

    // PUT
    .put('/:id', secure, training.update) // Used by save training in learner view

    // DELETE
    .delete('/:id', secure, training.delete)

    .delete('/', secure, training.deleteAll)

  app.use('/api/training', router)
}
