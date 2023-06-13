const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const approvals = require('../controllers/approvals.controller')

  const router = require('express').Router()

  router.post('/finance/:id', secure, approvals.finance)

  app.use('/api/approvals', router)
}
