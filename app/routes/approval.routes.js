const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const approval = require('../controllers/approval.controller')

  const router = require('express').Router()

  router.post('/', secure, approval.approveMultiple)

  router.post('/:id/reason', secure, approval.saveReason)

  router.post('/:id/:status', secure, approval.approve)

  router.put('/', secure, approval.approveMultiple)

  router.delete('/:id', secure, approval.undo)

  app.use('/api/approval', router)
}
