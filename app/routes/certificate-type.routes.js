const auth = require('../middleware/auth')
const cache = require('../middleware/cache')
const handler = require('../middleware/handler')

const secure = auth.validateToken

module.exports = (app) => {
  const certificateType = require('../controllers/certificate-type.controller')

  const router = require('express').Router()

  router.post('/', secure, certificateType.create, cache.del)

  router.get(
    '/',
    secure,
    cache.get,
    certificateType.findAll,
    cache.set,
    handler.resp
  )

  router.get(
    '/:id',
    secure,
    cache.get,
    certificateType.findOne,
    cache.set,
    handler.resp
  )

  router.put('/:id', secure, certificateType.update, cache.del)

  router.delete('/:id', secure, certificateType.delete, cache.del)

  router.delete('/', secure, certificateType.deleteAll, cache.del)

  app.use('/api/certificate-type', router)
}
