const auth = require('../middleware/auth')
const cache = require('../middleware/cache')
const handler = require('../middleware/handler')

const secure = auth.validateToken

module.exports = (app) => {
  const training = require('../controllers/training.controller')

  const router = require('express').Router()

  // POST
  router
    .post('/', secure, training.create, cache.del) // Create training in learner view

    // GET

    .get(
      '/active-period',
      secure,
      cache.get,
      training.getActivePeriod,
      cache.set,
      handler.resp
    ) // List all start years used in all training courses

    .get(
      '/month-by-year/:year',
      secure,
      cache.get,
      training.getLearnerByYear,
      cache.set,
      handler.resp
    ) // List all trained learners grouped month for a given year

    .get(
      '/course-by-year/:year',
      secure,
      cache.get,
      training.getCourseByYear,
      cache.set,
      handler.resp
    ) // List all course records count for a given year

    .get(
      '/course-month-by-year/:year',
      secure,
      cache.get,
      training.getCourseMonthByYear,
      cache.set,
      handler.resp
    ) // List all training records count grouped by course and month for a given year

    .get(
      '/course-type-by-year/:year',
      secure,
      cache.get,
      training.getCourseTypeByYear,
      cache.set,
      handler.resp
    ) // List all training records count grouped by course type and course for a given year

    .get(
      '/training-records',
      secure,
      cache.get,
      training.getTrainingRecords,
      cache.set,
      handler.resp
    ) // List all training records count grouped by course type and course for a given year

    .get(
      '/:id/all',
      secure,
      cache.get,
      training.getAllById,
      cache.set,
      handler.resp
    ) // List all training records by a given learner

    .get(
      '/:id/view',
      secure,
      cache.get,
      training.getOneView,
      cache.set,
      handler.resp
    ) // Gets the data needed for the Training View component and subcomponents

    .get(
      '/:date/:statuses',
      secure,
      cache.get,
      training.getAllByDate,
      cache.set,
      handler.resp
    ) // List all training records for a given date and status

    .get('/:id', secure, cache.get, training.getOne, cache.set, handler.resp) // Gets training record for a given id (for Edit form)

    // PUT
    .put('/:id', secure, training.update, cache.del) // Used by save training in learner view

    // DELETE
    .delete('/:id', secure, training.delete, cache.del)

    .delete('/', secure, training.deleteAll, cache.del)

  app.use('/api/training', router)
}
