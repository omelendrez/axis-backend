const router = require('express').Router()
const controller = require('../controllers/s3-document.controller')
const cache = require('../middleware/cache')

module.exports = (app) => {
  router.get('/exists', cache.get, controller.exists, cache.set, cache.res)

  router.get('/', cache.get, controller.getAll, cache.set, cache.res)

  router.post('/', controller.create, cache.res)

  router.put('/', controller.update, cache.res)

  router.delete('/:id', controller.delete, cache.res)

  app.use('/api/s3-document', router)
}
