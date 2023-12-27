const auth = require('../middleware/auth')
const cache = require('../middleware/cache')
const handler = require('../middleware/handler')

const secure = auth.validateToken

module.exports = (app) => {
  const course = require('../controllers/course.controller')

  const router = require('express').Router()

  router.post('/', secure, course.create, cache.del)

  router.get('/', secure, cache.get, course.findAll, cache.set, handler.resp)

  router.get('/:id', secure, cache.get, course.findOne, cache.set, handler.resp)

  router.get(
    '/:id/view',
    secure,
    cache.get,
    course.findOneView,
    cache.set,
    handler.resp
  )

  router.put('/:id', secure, course.update, cache.del)

  router.delete('/:id', secure, course.delete, cache.del)

  router.delete('/', secure, course.deleteAll, cache.del)

  app.use('/api/course', router)
}
