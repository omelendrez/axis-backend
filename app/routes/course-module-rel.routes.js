const router = require('express').Router()
const courseModuleRel = require('../controllers/course-module-rel.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  router.post('/', secure, courseModuleRel.create, cache.res)

  router.get(
    '/:id',
    secure,
    cache.get,
    courseModuleRel.findAll,
    cache.set,
    cache.res
  )

  router.get(
    '/:id/available',
    secure,
    cache.get,
    courseModuleRel.findAllAvailable,
    cache.get,
    cache.res
  )

  router.delete('/:id', secure, courseModuleRel.delete, cache.res)

  // router.delete('/', secure, courseModuleRel.deleteAll)

  app.use('/api/course-module-rel', router)
}
