const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const certificateType = require('../controllers/certificate-type.controller')

  const router = require('express').Router()

  router.post('/', secure, certificateType.create)

  router.get('/', secure, certificateType.findAll)

  router.get('/:id', secure, certificateType.findOne)

  router.put('/:id', secure, certificateType.update)

  router.delete('/:id', secure, certificateType.delete)

  router.delete('/', secure, certificateType.deleteAll)

  app.use('/api/certificate-type', router)
}
