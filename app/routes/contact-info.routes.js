const router = require('express').Router()
const contactInfo = require('../controllers/contact-info.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  router.post('/', secure, contactInfo.create, cache.res)

  router.get(
    '/:id/all',
    secure,
    cache.get,
    contactInfo.findAll,
    cache.set,
    cache.res
  )

  router.get(
    '/:id',
    secure,
    cache.get,
    contactInfo.findOne,
    cache.set,
    cache.res
  )

  router.put('/:id', secure, contactInfo.update, cache.res)

  router.delete('/:id', secure, contactInfo.delete, cache.res)

  // router.delete('/', secure, contactInfo.deleteAll, cache.res)

  app.use('/api/contact-info', router)
}
