const router = require('express').Router()
const learner = require('../controllers/learner.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  router.post('/', secure, learner.create, cache.res)

  router.get('/', secure, cache.get, learner.findAll, cache.set, cache.res)

  router.get('/:id', secure, cache.get, learner.findOne, cache.set, cache.res)

  router.get(
    '/:id/view',
    secure,
    cache.get,
    learner.findOneView,
    cache.set,
    cache.res
  )

  router.put('/:id', secure, learner.update, cache.res)

  router.delete('/:id', secure, learner.delete, cache.res)

  // router.delete('/', secure, learner.deleteAll)

  app.use('/api/learner', router)
}
