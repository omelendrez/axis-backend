const auth = require('../middleware/auth')
const cache = require('../middleware/cache')
const handler = require('../middleware/handler')

const secure = auth.validateToken

module.exports = (app) => {
  const courseModule = require('../controllers/course-module.controller')

  const router = require('express').Router()

  router.post('/', secure, courseModule.create, cache.del)

  router.get(
    '/',
    secure,
    cache.get,
    courseModule.findAll,
    cache.set,
    handler.resp
  )

  router.get(
    '/:id',
    secure,
    cache.get,
    courseModule.findOne,
    cache.set,
    handler.resp
  )

  router.get(
    '/:id/course',
    secure,
    cache.get,
    courseModule.findByCourse,
    cache.set,
    handler.resp
  )

  router.put('/:id', secure, courseModule.update, cache.del)

  router.delete('/:id', secure, courseModule.delete, cache.del)

  router.delete('/', secure, courseModule.deleteAll, cache.del)

  app.use('/api/course-module', router)
}
