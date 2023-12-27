const auth = require('../middleware/auth')
const cache = require('../middleware/cache')
const handler = require('../middleware/handler')

const secure = auth.validateToken

module.exports = (app) => {
  const contactType = require('../controllers/contact-type.controller')

  const router = require('express').Router()

  router.post('/', secure, contactType.create, cache.del)

  router.get(
    '/',
    secure,
    cache.get,
    contactType.findAll,
    cache.set,
    handler.resp
  )

  router.get(
    '/:id',
    secure,
    cache.get,
    contactType.findOne,
    cache.set,
    handler.resp
  )

  router.put('/:id', secure, contactType.update, cache.del)

  router.delete('/:id', secure, contactType.delete, cache.del)

  router.delete('/', secure, contactType.deleteAll, cache.del)

  app.use('/api/contact-type', router)
}
