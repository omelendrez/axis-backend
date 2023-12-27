const auth = require('../middleware/auth')
const cache = require('../middleware/cache')
const handler = require('../middleware/handler')

const secure = auth.validateToken

module.exports = (app) => {
  const company = require('../controllers/company.controller')

  const router = require('express').Router()

  router.post('/', secure, company.create, cache.del)

  router.get('/', secure, cache.get, company.findAll, cache.set, handler.resp)

  router.get(
    '/:id',
    secure,
    cache.get,
    company.findOne,
    cache.set,
    handler.resp
  )

  router.put('/:id', secure, company.update, cache.del)

  router.delete('/:id', secure, company.delete, cache.del)

  router.delete('/', secure, company.deleteAll, cache.del)

  app.use('/api/company', router)
}
