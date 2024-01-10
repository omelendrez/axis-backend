const { api } = require('../services/documentsClient.js')

const sendError = (controller, err) =>
  api.post('email/error-tracking', {
    controller,
    error: JSON.stringify(err, null, 2)
  })

module.exports = { sendError }
