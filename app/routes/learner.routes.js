const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const learner = require('../controllers/learner.controller')

  const router = require('express').Router()

  router.post('/', secure, learner.create)

  router.get('/', secure, learner.findAll)

  router.get('/:id', secure, learner.findOne)

  router.get('/:id/view', secure, learner.findOneView)

  router.put('/:id', secure, learner.update)

  router.delete('/:id', secure, learner.delete)

  router.delete('/', secure, learner.deleteAll)

  app.use('/api/learner', router)
}
