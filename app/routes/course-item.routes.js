const router = require('express').Router()
const courseItem = require('../controllers/course-item.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  router.post('/', secure, courseItem.create, cache.res)

  router.get('/', secure, cache.get, courseItem.findAll, cache.set, cache.res)

  router.get(
    '/:id',
    secure,
    cache.get,
    courseItem.findOne,
    cache.set,
    cache.res
  )

  router.put('/:id', secure, courseItem.update, cache.res)

  router.delete('/:id', secure, courseItem.delete, cache.res)

  // router.delete('/', secure, courseItem.deleteAll)

  app.use('/api/course-item', router)
}
