const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const contactType = require('../controllers/contact-type.controller')

  const router = require('express').Router()

  router.post('/', secure, contactType.create)

  router.get('/', secure, contactType.findAll)

  router.get('/:id', secure, contactType.findOne)

  router.put('/:id', secure, contactType.update)

  router.delete('/:id', secure, contactType.delete)

  router.delete('/', secure, contactType.deleteAll)

  app.use('/api/contact-type', router)
}
