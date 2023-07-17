const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const training = require('../controllers/training.controller')

  const router = require('express').Router()

  // POST
  router
    .post('/', secure, training.create) // Create training in learner view

    // GET
    .get('/:id/all', secure, training.getAll) // List all training records by a given learner

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
