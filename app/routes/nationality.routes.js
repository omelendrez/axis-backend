const auth = require('../middleware/auth')
const cache = require('../middleware/cache')
const handler = require('../middleware/handler')

const secure = auth.validateToken

module.exports = (app) => {
  const nationality = require('../controllers/nationality.controller')

  const router = require('express').Router()

  router.post('/', secure, nationality.create, cache.del)

  router.get(
    '/',
    secure,
    cache.get,
    nationality.findAll,
    cache.set,
    handler.resp
  )

  router.get(
    '/:id',
    secure,
    cache.get,
    nationality.findOne,
    cache.set,
    handler.resp
  )

  router.put('/:id', secure, nationality.update, cache.del)

  router.delete('/:id', secure, nationality.delete, cache.del)

  router.delete('/', secure, nationality.deleteAll, cache.del)

  app.use('/api/nationality', router)
}
