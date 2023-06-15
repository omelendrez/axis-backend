const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const approvals = require('../controllers/approvals.controller')

  const router = require('express').Router()

  router.post('/finance/:id', secure, approvals.finance)

  router.post('/finance/:id/cancel', secure, approvals.undo)

  app.use('/api/approvals', router)
}
