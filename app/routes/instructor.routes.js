const router = require('express').Router()
const instructor = require('../controllers/instructor.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  // POST
  router.post('/', secure, instructor.create, cache.res) // Create instructor in learner view

  // DELETE
  router.delete('/:id', secure, instructor.delete, cache.res)

  app.use('/api/instructor', router)
}
