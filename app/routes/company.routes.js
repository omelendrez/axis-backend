const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const company = require('../controllers/company.controller.js')

  const router = require('express').Router()

  router.post('/', secure, company.create)

  router.get('/', secure, company.findAll)

  router.get('/:id', secure, company.findOne)

  router.put('/:id', secure, company.update)

  router.delete('/:id', secure, company.delete)

  router.delete('/', secure, company.deleteAll)

  app.use('/api/company', router)
}
