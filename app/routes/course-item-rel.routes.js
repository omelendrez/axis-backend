const auth = require('../middleware/auth')
const cache = require('../middleware/cache')
const handler = require('../middleware/handler')

const secure = auth.validateToken

module.exports = (app) => {
  const courseItemRel = require('../controllers/course-item-rel.controller')

  const router = require('express').Router()

  router.post('/', secure, courseItemRel.create, cache.del)

  router.get(
    '/:id',
    secure,
    cache.get,
    courseItemRel.findAll,
    cache.set,
    handler.resp
  )

  router.get(
    '/:id/available',
    secure,
    cache.get,
    courseItemRel.findAllAvailable,
    cache.set,
    handler.resp
  )

  router.delete('/:id', secure, courseItemRel.delete, cache.del)

  router.delete('/', secure, courseItemRel.deleteAll, cache.del)

  app.use('/api/course-item-rel', router)
}
