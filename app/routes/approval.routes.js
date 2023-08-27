const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const approval = require('../controllers/approval.controller')

  const router = require('express').Router()

  router.post('/:id/:status', secure, approval.approve)

  router.post('/:id/reason', secure, approval.saveReason)

  router.delete('/:id', secure, approval.undo)

  app.use('/api/approval', router)
}
