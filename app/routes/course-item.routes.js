const auth = require('../middleware/auth')
const cache = require('../middleware/cache')
const handler = require('../middleware/handler')

const secure = auth.validateToken

module.exports = (app) => {
  const courseItem = require('../controllers/course-item.controller')

  const router = require('express').Router()

  router.post('/', secure, courseItem.create, cache.del)

  router.get(
    '/',
    secure,
    cache.get,
    courseItem.findAll,
    cache.set,
    handler.resp
  )

  router.get(
    '/:id',
    secure,
    cache.get,
    courseItem.findOne,
    cache.set,
    handler.resp
  )

  router.put('/:id', secure, courseItem.update, cache.del)

  router.delete('/:id', secure, courseItem.delete, cache.del)

  router.delete('/', secure, courseItem.deleteAll, cache.del)

  app.use('/api/course-item', router)
}
