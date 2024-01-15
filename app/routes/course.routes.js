const router = require('express').Router()
const course = require('../controllers/course.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  router.post('/', secure, course.create, cache.res)

  router.get('/', secure, cache.get, course.findAll, cache.set, cache.res)

  router.get('/:id', secure, cache.get, course.findOne, cache.set, cache.res)

  router.get(
    '/:id/view',
    secure,
    cache.get,
    course.findOneView,
    cache.set,
    cache.res
  )

  router.put('/:id', secure, course.update, cache.res)

  router.delete('/:id', secure, course.delete, cache.res)

  // router.delete('/', secure, course.deleteAll)

  app.use('/api/course', router)
}
