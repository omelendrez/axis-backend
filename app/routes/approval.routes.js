const router = require('express').Router()
const approval = require('../controllers/approval.controller')
const auth = require('../middleware/auth')
const cache = require('../middleware/cache')

const secure = auth.validateToken

module.exports = (app) => {
  router.post('/', secure, approval.approveMultiple, cache.res)

  router.post('/:id/reason', secure, approval.saveReason, cache.res)

  router.post('/:id/:status', secure, approval.approve, cache.res)

  router.put('/', secure, approval.approveMultiple, cache.res)

  router.delete('/:id', secure, approval.undo, cache.res)

  app.use('/api/approval', router)
}
