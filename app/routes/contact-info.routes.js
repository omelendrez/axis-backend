const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const contactInfo = require('../controllers/contact-info.controller.js')

  const router = require('express').Router()

  router.post('/', secure, contactInfo.create)

  router.get('/:id/all', secure, contactInfo.findAll)

  router.get('/:id', secure, contactInfo.findOne)

  router.put('/:id', secure, contactInfo.update)

  router.delete('/:id', secure, contactInfo.delete)

  router.delete('/', secure, contactInfo.deleteAll)

  app.use('/api/contact-info', router)
}
