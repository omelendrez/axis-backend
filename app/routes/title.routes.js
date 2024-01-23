const router = require('express').Router()
const title = require('../controllers/title.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  router.get('/', secure, cache.get, title.findAll, cache.set, cache.res)

  app.use('/api/title', router)
}
