const router = require('express').Router()
const opito = require('../controllers/opito.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  router.put('/:id', secure, opito.saveFieldValues, cache.res)

  router.get('/', secure, cache.get, opito.findAll, cache.set, cache.res)

  router.get('/file', secure, cache.get, opito.fileList, cache.set, cache.res)

  router.get(
    '/content',
    secure,
    cache.get,
    opito.fileContent,
    cache.set,
    cache.res
  )

  app.use('/api/opito', router)
}
