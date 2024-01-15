const router = require('express').Router()
const certificateType = require('../controllers/certificate-type.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  router.post('/', secure, certificateType.create, cache.res)

  router.get(
    '/',
    secure,
    cache.get,
    certificateType.findAll,
    cache.set,
    cache.res
  )

  router.get(
    '/:id',
    secure,
    cache.get,
    certificateType.findOne,
    cache.set,
    cache.res
  )

  router.put('/:id', secure, certificateType.update, cache.res)

  router.delete('/:id', secure, certificateType.delete, cache.res)

  // router.delete('/', secure, certificateType.deleteAll, cache.res)

  app.use('/api/certificate-type', router)
}
