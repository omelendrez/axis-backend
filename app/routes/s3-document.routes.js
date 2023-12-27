module.exports = (app) => {
  const controller = require('../controllers/s3-document.controller')
  const cache = require('../middleware/cache')
  const handler = require('../middleware/handler')

  const router = require('express').Router()

  router.get('/exists', cache.get, controller.exists, cache.set, handler.resp)

  router.get('/', cache.get, controller.getAll, cache.set, handler.resp)

  router.post('/', controller.create, cache.del)

  router.put('/', controller.update, cache.del)

  router.delete('/:id', controller.delete, cache.del)

  app.use('/api/s3-document', router)
}
