const auth = require('../middleware/auth')
const cache = require('../middleware/cache')
const handler = require('../middleware/handler')

const secure = auth.validateToken

module.exports = (app) => {
  const opito = require('../controllers/opito.controller')

  const router = require('express').Router()

  router.put('/:id', secure, opito.saveFieldValues, cache.del)

  router.get('/', secure, cache.get, opito.findAll, cache.set, handler.resp)

  router.get(
    '/file',
    secure,
    cache.get,
    opito.fileList,
    cache.set,
    handler.resp
  )

  router.get(
    '/content',
    secure,
    cache.get,
    opito.fileContent,
    cache.set,
    handler.resp
  )

  app.use('/api/opito', router)
}
