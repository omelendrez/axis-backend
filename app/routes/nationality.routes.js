const router = require('express').Router()
const nationality = require('../controllers/nationality.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  router.post('/', secure, nationality.create, cache.res)

  router.get('/', secure, cache.get, nationality.findAll, cache.set, cache.res)

  router.get(
    '/:id',
    secure,
    cache.get,
    nationality.findOne,
    cache.set,
    cache.res
  )

  router.put('/:id', secure, nationality.update, cache.res)

  router.delete('/:id', secure, nationality.delete, cache.res)

  // router.delete('/', secure, nationality.deleteAll)

  app.use('/api/nationality', router)
}
