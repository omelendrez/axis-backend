const router = require('express').Router()
const auth = require('../middleware/auth')
const contactType = require('../controllers/contact-type.controller')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  router.post('/', secure, contactType.create, cache.res)

  router.get('/', secure, cache.get, contactType.findAll, cache.set, cache.res)

  router.get(
    '/:id',
    secure,
    cache.get,
    contactType.findOne,
    cache.set,
    cache.res
  )

  router.put('/:id', secure, contactType.update, cache.res)

  router.delete('/:id', secure, contactType.delete, cache.res)

  // router.delete('/', secure, contactType.deleteAll, cache.res)

  app.use('/api/contact-type', router)
}
