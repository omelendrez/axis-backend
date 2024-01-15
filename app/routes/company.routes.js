const router = require('express').Router()
const company = require('../controllers/company.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  router.post('/', secure, company.create, cache.res)

  router.get('/', secure, cache.get, company.findAll, cache.set, cache.res)

  router.get('/:id', secure, cache.get, company.findOne, cache.set, cache.res)

  router.put('/:id', secure, company.update, cache.res)

  router.delete('/:id', secure, company.delete, cache.res)

  // router.delete('/', secure, company.deleteAll, cache.res)

  app.use('/api/company', router)
}
