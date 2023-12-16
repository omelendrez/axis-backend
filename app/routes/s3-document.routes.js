module.exports = (app) => {
  const controller = require('../controllers/s3-document.controller')

  const router = require('express').Router()

  router.get('/exists', controller.exists)

  router.get('/', controller.getAll)

  router.post('/', controller.create)

  router.put('/', controller.update)

  app.use('/api/s3-document', router)
}
