const router = require('express').Router()
const courseItemRel = require('../controllers/course-item-rel.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  router.post('/', secure, courseItemRel.create, cache.res)

  router.get(
    '/:id',
    secure,
    cache.get,
    courseItemRel.findAll,
    cache.set,
    cache.res
  )

  router.get(
    '/:id/available',
    secure,
    cache.get,
    courseItemRel.findAllAvailable,
    cache.set,
    cache.res
  )

  router.delete('/:id', secure, courseItemRel.delete, cache.res)

  // router.delete('/', secure, courseItemRel.deleteAll)

  app.use('/api/course-item-rel', router)
}
