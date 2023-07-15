const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const nationality = require('../controllers/nationality.controller')

  const router = require('express').Router()

  router.post('/', secure, nationality.create)

  router.get('/', secure, nationality.findAll)

  router.get('/:id', secure, nationality.findOne)

  router.put('/:id', secure, nationality.update)

  router.delete('/:id', secure, nationality.delete)

  router.delete('/', secure, nationality.deleteAll)

  app.use('/api/nationality', router)
}
