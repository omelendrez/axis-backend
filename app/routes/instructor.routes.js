const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const instructor = require('../controllers/instructor.controller')

  const router = require('express').Router()

  // POST
  router
    .post('/', secure, instructor.create) // Create instructor in learner view

    // DELETE
    .delete('/:id', secure, instructor.delete)

  app.use('/api/instructor', router)
}
