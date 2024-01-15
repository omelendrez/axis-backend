const router = require('express').Router()
const training = require('../controllers/training.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  // POST
  router.post('/', secure, training.create, cache.res) // Create training in learner view

  // GET
  router.get(
    '/active-period',
    secure,
    cache.get,
    training.getActivePeriod,
    cache.set,
    cache.res
  ) // List all start years used in all training courses

  router.get(
    '/month-by-year/:year',
    secure,
    cache.get,
    training.getLearnerByYear,
    cache.set,
    cache.res
  ) // List all trained learners grouped month for a given year

  router.get(
    '/course-by-year/:year',
    secure,
    cache.get,
    training.getCourseByYear,
    cache.set,
    cache.res
  ) // List all course records count for a given year

  router.get(
    '/course-month-by-year/:year',
    secure,
    cache.get,
    training.getCourseMonthByYear,
    cache.set,
    cache.res
  ) // List all training records count grouped by course and month for a given year

  router.get(
    '/course-type-by-year/:year',
    secure,
    cache.get,
    training.getCourseTypeByYear,
    cache.set,
    cache.res
  ) // List all training records count grouped by course type and course for a given year

  router.get(
    '/training-records',
    secure,
    cache.get,
    training.getTrainingRecords,
    cache.set,
    cache.res
  ) // List all training records count grouped by course type and course for a given year

  router.get(
    '/:id/all',
    secure,
    cache.get,
    training.getAllById,
    cache.set,
    cache.res
  ) // List all training records by a given learner

  router.get(
    '/:id/view',
    secure,
    cache.get,
    training.getOneView,
    cache.set,
    cache.res
  ) // Gets the data needed for the Training View component and subcomponents

  router.get(
    '/:date/:statuses',
    secure,
    cache.get,
    training.getAllByDate,
    cache.set,
    cache.res
  ) // List all training records for a given date and status

  router.get('/:id', secure, cache.get, training.getOne, cache.set, cache.res) // Gets training record for a given id (for Edit form)

  // PUT
  router.put('/:id', secure, training.update, cache.res) // Used by save training in learner view

  // DELETE
  router.delete('/:id', secure, training.delete, cache.res)

  // .delete('/', secure, training.deleteAll)

  app.use('/api/training', router)
}
