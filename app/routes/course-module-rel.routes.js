const auth = require('../middleware/auth')
const cache = require('../middleware/cache')
const handler = require('../middleware/handler')

const secure = auth.validateToken

module.exports = (app) => {
  const courseModuleRel = require('../controllers/course-module-rel.controller')

  const router = require('express').Router()

  router.post('/', secure, courseModuleRel.create, cache.del)

  router.get(
    '/:id',
    secure,
    cache.get,
    courseModuleRel.findAll,
    cache.set,
    handler.resp
  )

  router.get(
    '/:id/available',
    secure,
    cache.get,
    courseModuleRel.findAllAvailable,
    cache.set,
    handler.resp
  )

  router.delete('/:id', secure, courseModuleRel.delete, cache.del)

  router.delete('/', secure, courseModuleRel.deleteAll, cache.del)

  app.use('/api/course-module-rel', router)
}
