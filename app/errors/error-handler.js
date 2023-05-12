'use strict'

const { log } = require('../helpers/log')
const messages = require('./messages.json')

/**
 * @exports errorHandler
 */
const errorHandler = {}

/**
 * @type Object
 * @typedef TransformedError
 * @property {Number} code - http status code corresponding to the error
 * @property {Object} body - json response body
 * @property {String} body.error - error name/type
 * @property {String} body.message - a short description about the error
 * @property {*} [body.detail] - optional details to send to client
 *
 * @example
 * {
 *   "code": 500,
 *   "body": {
 *     "error": "error_name",
 *     "message": "error description",
 *     "detail": "optional response field for certain errors"
 *   }
 * }
 */

/**
 * Transforms a caught error into an object containing a status code and
 * a response body
 *
 * If err does not have a statusCode property or the statusCode property
 * is 500, the error's message is discarded and it is returned as a server error
 *
 * @param {Error} err - the error to transform
 * @return {TransformedError} the transformed error
 */
errorHandler.handle = function (err) {
  const code = Number.isFinite(err.response?.status) ? err.response.status : 500
  const body = err.data ? err.data : {}

  if (code === 500) {
    body.error = 'server_error'
    body.message = messages.serverError
  } else {
    body.error = err.name
    body.message = err.message
  }

  if (err.detail) {
    body.detail = err.detail
  }

  return { code, body }
}

/**
 * Handle and log all errors passed down the route chain
 *
 * @implements {external:Express~ErrorHandler}
 */
// eslint-disable-next-line no-unused-vars
errorHandler.middleware = function (err, req, res, _next) {
  // express error handling middleware need 'next' to be defined, otherwise
  // they will be incorrectly recognized as a normal middleware.

  const { code, body } = errorHandler.handle(err)

  if (req.log) {
    log.error(err)
    req.log.error(err)
  }

  res.status(code).json(body)
}

module.exports = errorHandler
