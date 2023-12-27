const auth = require('../middleware/auth')
const cache = require('../middleware/cache')
const handler = require('../middleware/handler')

const secure = auth.validateToken

module.exports = (app) => {
  const learner = require('../controllers/learner.controller')

  const router = require('express').Router()

  router.post('/', secure, learner.create, cache.del)

  router.get('/', secure, cache.get, learner.findAll, cache.set, handler.resp)

  router.get(
    '/:id',
    secure,
    cache.get,
    learner.findOne,
    cache.set,
    handler.resp
  )

  router.get(
    '/:id/view',
    secure,
    cache.get,
    learner.findOneView,
    cache.set,
    handler.resp
  )

  router.put('/:id', secure, learner.update, cache.del)

  router.delete('/:id', secure, learner.delete, cache.del)

  router.delete('/', secure, learner.deleteAll, cache.del)

  app.use('/api/learner', router)
}
