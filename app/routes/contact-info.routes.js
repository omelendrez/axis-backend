const auth = require('../middleware/auth')
const cache = require('../middleware/cache')
const handler = require('../middleware/handler')

const secure = auth.validateToken

module.exports = (app) => {
  const contactInfo = require('../controllers/contact-info.controller')

  const router = require('express').Router()

  router.post('/', secure, contactInfo.create, cache.del)

  router.get(
    '/:id/all',
    secure,
    cache.get,
    contactInfo.findAll,
    cache.set,
    handler.resp
  )

  router.get(
    '/:id',
    secure,
    cache.get,
    contactInfo.findOne,
    cache.set,
    handler.resp
  )

  router.put('/:id', secure, contactInfo.update, cache.del)

  router.delete('/:id', secure, contactInfo.delete, cache.del)

  router.delete('/', secure, contactInfo.deleteAll, cache.del)

  app.use('/api/contact-info', router)
}
